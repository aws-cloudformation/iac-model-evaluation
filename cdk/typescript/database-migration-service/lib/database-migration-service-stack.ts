import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dms from 'aws-cdk-lib/aws-dms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as kms from 'aws-cdk-lib/aws-kms';

export class DatabaseMigrationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    
    //This will be used in DMS Replication SubnetGroup
    const dmsSubnet1 = 'subnet-xxxx';
    
    //This will be used in DMS Replication SubnetGroup, please provide a Subnet in the same VPC but in a different Availability Zone than DBSubnet1
    const dmsSubnet2 = 'subnet-xxxx';

    //Specifies the VPC security group to be used with the replication instance
    const dmsSecurityGroup = 'sg-xxxx';
    
    //Specifies the compute and memory capacity of the replication instance
    const dmsInstanceClass = 'dms.t3.medium';

    //Specifies a name for the replication instance
    const dmsInstanceName = 'sample-repinstance';
    
    //Specifies the PostgreSql Database Name you want to use as Target Endpoint
    const postgresqlDatabaseName = 'sample-postgresql-for-dms';
    
    //Specifies the ServerName to be used with the DMS source endpoint (Writer endpoint of the Database)
    const serverName = '<aurora-cluster-name>.cluster-<uuid>.<region>.rds.amazonaws.com';
    
    //Specifies the BucketName to be used with the DMS target endpoint
    const bucketName = 'sample-bucket-name';
    
    //If the dms-vpc-role exists in your account, please enter Y, else enter N
    const existsDmsVpcRole = 'N';
    
    //If the dms-cloudwatch-logs-role exists in your account, please enter Y, else enter N
    const existsDmsCloudwatchRole = 'N'


    // Conditions
    const notExistsDmsVpcRole = new cdk.CfnCondition(this, 'NotExistsDMSVPCRole', {
      expression: cdk.Fn.conditionEquals(existsDmsVpcRole, 'N')
    });

    const notExistsDmsCloudwatchRole = new cdk.CfnCondition(this, 'NotExistsDMSCloudwatchRole', {
      expression: cdk.Fn.conditionEquals(existsDmsCloudwatchRole, 'N')
    });


    // Resources
    
    // IAM role 'dms-cloudwatch-logs-role' to provide access to upload DMS replication logs to cloudwatch logs
    const dmsCloudwatchRole = new iam.Role(this, 'DMSCloudwatchRole', {
      roleName: 'dms-cloudwatch-logs-role',
      assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonDMSCloudWatchLogsRole')
      ]
    });
    (dmsCloudwatchRole.node.defaultChild as iam.CfnRole).cfnOptions.condition = notExistsDmsCloudwatchRole;
    
    // IAM role 'dms-vpc-role' to manage VPC settings for AWS managed customer configurations
    const dmsVpcRole = new iam.Role(this, 'DMSVpcRole', {
      roleName: 'dms-vpc-role',
      assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonDMSVPCManagementRole')
      ]
    });
    (dmsVpcRole.node.defaultChild as iam.CfnRole).cfnOptions.condition = notExistsDmsVpcRole;
    
    // IAM role with write and delete access to the S3 bucket
    const s3TargetDmsRole = new iam.Role(this, 'S3TargetDMSRole', {
      roleName: 'dms-s3-target-role',
      assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
      inlinePolicies: {
        S3AccessForDMSPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:PutObject', 's3:DeleteObject'],
              resources: [
                `arn:aws:s3:::${bucketName}`,
                `arn:aws:s3:::${bucketName}/*`
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [
                `arn:aws:s3:::${bucketName}`
              ]
            })
          ]
        })
      }
    });

    // DMS Replication Subnet Group
    const dmsReplicationSubnetGroup = new dms.CfnReplicationSubnetGroup(this, 'DMSReplicationSubnetGroup', {
      replicationSubnetGroupDescription: 'Subnets available for DMS',
      subnetIds: [dmsSubnet1, dmsSubnet2]
    });
    dmsReplicationSubnetGroup.node.addDependency(s3TargetDmsRole);

    // DMS Replication Instance
    const dmsReplicationInstance = new dms.CfnReplicationInstance(this, 'DMSReplicationInstance', {
      replicationInstanceClass: dmsInstanceClass,
      replicationInstanceIdentifier: dmsInstanceName,
      replicationSubnetGroupIdentifier: dmsReplicationSubnetGroup.ref,
      vpcSecurityGroupIds: [dmsSecurityGroup],
      multiAz: true,
      publiclyAccessible: false
    });
    

    //////////////////////////////////////////////////////////////////////////
    // Replicate data from Aurora to S3 with AWS Database Migration Service //
    //////////////////////////////////////////////////////////////////////////
    //Get the secret that store the Aurora Database username and password
    const secretsManagerSecretForAurora = secretsmanager.Secret.fromSecretCompleteArn(this, 'SecretsManagerSecretNameforAurora', 
      'arn:aws:secretsmanager:ap-southeast-2:743311230884:secret:aurora-source-enpoint-password-YMzobS'
    );
    
    // Aurora Source Endpoint
    const auroraSourceEndpoint = new dms.CfnEndpoint(this, 'AuroraSourceEndpoint', {
      endpointType: 'source',
      engineName: 'aurora',
      username: cdk.Fn.sub(`{{resolve:secretsmanager:${secretsManagerSecretForAurora.secretName}:SecretString:username}}`),
      password: cdk.Fn.sub(`{{resolve:secretsmanager:${secretsManagerSecretForAurora.secretName}:SecretString:password}}`),
      port: 3306,
      serverName: serverName
    });
    auroraSourceEndpoint.node.addDependency(dmsReplicationInstance);

    // S3 Target Endpoint
    const s3TargetEndpoint = new dms.CfnEndpoint(this, 'S3TargetEndpoint', {
      endpointType: 'target',
      engineName: 's3',
      extraConnectionAttributes: 'addColumnName=true',
      s3Settings: {
        bucketName: bucketName,
        serviceAccessRoleArn: s3TargetDmsRole.roleArn
      }
    });
    s3TargetEndpoint.node.addDependency(dmsReplicationInstance);


    /////////////////////////////////////////////////////////////////////////////////
    // Replicate data from MySQL to PostgreSQL with AWS Database Migration Service //
    /////////////////////////////////////////////////////////////////////////////////
    //Get SecretsManagerSecret that contains the MySQL endpoint connection detail
    const secretsManagerSecretForMySql = secretsmanager.Secret.fromSecretCompleteArn(this, 'SecretsManagerSecretARNforMySql', 
      'arn:aws:secretsmanager:<aws_region>:<aws_account>:secret:<secret_name>-uuid'
    );
    
    //Get SecretsManagerSecret that contains the PostgreSQL endpoint connection detail
    const secretsManagerSecretForPostgresql = secretsmanager.Secret.fromSecretCompleteArn(this, 'SecretsManagerSecretARNforPostgreSql', 
      'arn:aws:secretsmanager:<aws_region>:<aws_account>:secret:<secret_name>-uuid'
    );
    
    //Get KMS Arn that encrypt your secret for MySQL Database
    const kmsArnEncryptSecretForMysql = kms.Key.fromKeyArn(this, 'KmsArnEncryptSecretforMySqlDatabase',
      'arn:aws:kms:<aws_region>:<aws_account>:key/<key_id>'
    );
    
    //Get KMS Arn that encrypt your secret for PostgreSQL Database
    const kmsArnEncryptSecretForPostgresql = kms.Key.fromKeyArn(this, 'KmsArnEncryptSecretforPostgreSqlDatabase',
      'arn:aws:kms:<aws_region>:<aws_account>:key/<key_id>'
    );
    
    // IAM role to access SecretsManager
    const secretsManagerAccessRoleForDatabases = new iam.Role(this, 'SecretsManagerAccessRoleForDatabases', {
      roleName: 'dms-secret-manager-access-role',
      assumedBy: new iam.ServicePrincipal('dms.amazonaws.com'),
      inlinePolicies: {
        SecretsManagerPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['kms:Decrypt', 'kms:DescribeKey'],
              resources: [
                kmsArnEncryptSecretForMysql.keyArn,
                kmsArnEncryptSecretForPostgresql.keyArn
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['secretsmanager:GetSecretValue'],
              resources: [
                secretsManagerSecretForMySql.secretArn,
                secretsManagerSecretForPostgresql.secretArn
              ]
            })
          ]
        })
      }
    });
    
    // MySQL Source Endpoint
    const mysqlSourceEndpoint = new dms.CfnEndpoint(this, 'MySQLSourceEndpoint', {
      endpointType: 'source',
      engineName: 'mysql',
      mySqlSettings: {
        secretsManagerAccessRoleArn: secretsManagerAccessRoleForDatabases.roleArn,
        secretsManagerSecretId: secretsManagerSecretForMySql.secretArn
      }
    });
    mysqlSourceEndpoint.node.addDependency(dmsReplicationInstance);
 
    // PostgreSQL Target Endpoint
    const postgresqlTargetEndpoint = new dms.CfnEndpoint(this, 'PostgreSqlTargetEndpoint', {
      endpointType: 'target',
      engineName: 'postgres',
      databaseName: postgresqlDatabaseName,
      postgreSqlSettings: {
        secretsManagerAccessRoleArn: secretsManagerAccessRoleForDatabases.roleArn,
        secretsManagerSecretId: secretsManagerSecretForPostgresql.secretArn
      }
    });
    postgresqlTargetEndpoint.node.addDependency(dmsReplicationInstance);


    // Replication Task From Aurora Source to S3 Target
    new dms.CfnReplicationTask(this, 'DMSReplicationTaskFromAuroraSourcetoS3Target', {
      migrationType: 'full-load-and-cdc',
      replicationInstanceArn: dmsReplicationInstance.ref,
      replicationTaskSettings: JSON.stringify({
        Logging: {
          EnableLogging: true,
          LogComponents: [
            { Id: 'SOURCE_UNLOAD', Severity: 'LOGGER_SEVERITY_DEFAULT' },
            { Id: 'SOURCE_CAPTURE', Severity: 'LOGGER_SEVERITY_DEFAULT' },
            { Id: 'TARGET_LOAD', Severity: 'LOGGER_SEVERITY_DEFAULT' },
            { Id: 'TARGET_APPLY', Severity: 'LOGGER_SEVERITY_DEFAULT' },
          ],
        },
      }),
      sourceEndpointArn: auroraSourceEndpoint.ref,
      tableMappings: JSON.stringify({
        rules: [
          {
            'rule-type': 'selection',
            'rule-id': '1',
            'rule-name': '1',
            'object-locator': { 'schema-name': '%', 'table-name': '%' },
            'rule-action': 'include',
          },
        ],
      }),
      targetEndpointArn: s3TargetEndpoint.ref,
    });

    // Replication Task From MySQL Source to PostgreSQL Target
    new dms.CfnReplicationTask(this, 'DMSReplicationTaskFromMySQLSourcetoPostgreSQLTarget', {
      migrationType: 'full-load',
      replicationInstanceArn: dmsReplicationInstance.ref,
      replicationTaskSettings: JSON.stringify({
        FullLoadSettings: {
          CommitRate: 10000,
          TargetTablePrepMode: 'DROP_AND_CREATE',
          CreatePkAfterFullLoad: true,
        },
        ControlTablesSettings: {
          historyTimeslotInMinutes: 5,
        },
      }),
      sourceEndpointArn: mysqlSourceEndpoint.ref,
      tableMappings: JSON.stringify({
        rules: [
          {
            'rule-type': 'selection',
            'rule-id': '1',
            'rule-name': '1',
            'object-locator': { 'schema-name': '%', 'table-name': '%' },
            'rule-action': 'include',
          },
        ],
      }),
      targetEndpointArn: postgresqlTargetEndpoint.ref
    });
    
  }
}
