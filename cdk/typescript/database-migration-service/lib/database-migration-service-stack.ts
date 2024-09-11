import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dms from 'aws-cdk-lib/aws-dms';

export class DatabaseMigrationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const dmsSubnet1 = new cdk.CfnParameter(this, 'DMSSubnet1', {
      type: 'String',
      default: 'subnet-99c711d1',
      description: 'This will be used in DMS Replication SubnetGroup.'
    });

    const dmsSubnet2 = new cdk.CfnParameter(this, 'DMSSubnet2', {
      type: 'String',
      default: 'subnet-65248103',
      description: 'This will be used in DMS Replication SubnetGroup, please provide a Subnet in the same VPC but in a different Availability Zone than DBSubnet1.'
    });

    const dmsSecurityGroup = new cdk.CfnParameter(this, 'DMSSecurityGroup', {
      type: 'String',
      default: 'sg-0af21d0643e2975c0',
      description: 'Specifies the VPC security group to be used with the replication instance.'
    });

    const dmsInstanceClass = new cdk.CfnParameter(this, 'DMSReplicationInstanceClass', {
      type: 'String',
      default: 'dms.t3.medium',
      description: 'Specifies the compute and memory capacity of the replication instance.'
    });

    const dmsInstanceName = new cdk.CfnParameter(this, 'DMSReplicationInstanceName', {
      type: 'String',
      default: 'aurora-s3-repinstance-sampledb',
      description: 'Specifies a name for the replication instance.'
    });
    
    const secretsManagerSecretNameForAurora = new cdk.CfnParameter(this, 'SecretsManagerSecretNameforAurora', {
      type: 'String',
      default: 'aurora-source-enpoint-password',
      description: 'Specifies a name for the replication instance.',
    });

    const secretsManagerMysqlArn = new cdk.CfnParameter(this, 'SecretsManagerSecretARNforMySql', {
      type: 'String',
      default: 'arn:aws:secretsmanager:ap-southeast-2:743311230884:secret:mysql-source-enpoint-password-wDTuWi',
      description: 'Specifies the ARN of the SecretsManagerSecret that contains the MySQL endpoint connection details.'
    });

    const secretsManagerPostgresqlArn = new cdk.CfnParameter(this, 'SecretsManagerSecretARNforPostgreSql', {
      type: 'String',
      default: 'arn:aws:secretsmanager:ap-southeast-2:743311230884:secret:rds!cluster-bd97e94b-9c47-4949-85e4-cc94e6e6c10a-ZzoS7C',
      description: 'Specifies the ARN of the SecretsManagerSecret that contains the PostgreSQL endpoint connection details.'
    });
    
    const kmsArnEncryptSecretForMySql = new cdk.CfnParameter(this, 'KmsArnEncryptSecretforMySqlDatabase', {
      type: 'String',
      default: 'arn:aws:kms:ap-southeast-2:743311230884:key/1837311a-1324-48ec-ad51-434021c0c128',
      description: 'Specifies the ARN of the AWS KMS key that you are using to encrypt your secret for MySql Database.',
    });

    const kmsArnEncryptSecretForPostgresql = new cdk.CfnParameter(this, 'KmsArnEncryptSecretforPostgreSqlDatabase', {
      type: 'String',
      default: 'arn:aws:kms:ap-southeast-2:743311230884:key/1837311a-1324-48ec-ad51-434021c0c128',
      description: 'Specifies the ARN of the AWS KMS key that you are using to encrypt your secret for PostgreSql Database.',
    });

    const postgresqlDatabaseName = new cdk.CfnParameter(this, 'PostgreSqlDatabaseName', {
      type: 'String',
      default: 'tfc-postgresql-for-dms',
      description: 'Specifies the PostgreSql Database Name you want to use as Target Endpoint',
    });

    const serverName = new cdk.CfnParameter(this, 'ServerName', {
      type: 'String',
      default: 'tfc-aurora-for-dms.cluster-cffq5lflulbb.ap-southeast-2.rds.amazonaws.com',
      description: 'Specifies the ServerName to be used with the DMS source endpoint (Writer endpoint of the Database).'
    });

    const bucketName = new cdk.CfnParameter(this, 'BucketName', {
      type: 'String',
      default: 'jiangulanht',
      description: 'Specifies the BucketName to be used with the DMS target endpoint.'
    });

    const existsDmsVpcRole = new cdk.CfnParameter(this, 'ExistsDMSVPCRole', {
      type: 'String',
      default: 'N',
      minLength: 1,
      maxLength: 1,
      allowedPattern: '[YN]',
      description: 'If the dms-vpc-role exists in your account, please enter Y, else enter N.'
    });

    const existsDmsCloudwatchRole = new cdk.CfnParameter(this, 'ExistsDMSCloudwatchRole', {
      type: 'String',
      default: 'N',
      minLength: 1,
      maxLength: 1,
      allowedPattern: '[YN]',
      description: 'If the dms-cloudwatch-logs-role exists in your account, please enter Y, else enter N.'
    });

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
                cdk.Fn.sub('arn:aws:s3:::${BucketName}'),
                cdk.Fn.sub('arn:aws:s3:::${BucketName}/*')
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [cdk.Fn.sub('arn:aws:s3:::${BucketName}')]
            })
          ]
        })
      }
    });

    // DMS Replication Subnet Group
    const dmsReplicationSubnetGroup = new dms.CfnReplicationSubnetGroup(this, 'DMSReplicationSubnetGroup', {
      replicationSubnetGroupDescription: 'Subnets available for DMS',
      subnetIds: [dmsSubnet1.valueAsString, dmsSubnet2.valueAsString]
    });
    dmsReplicationSubnetGroup.node.addDependency(s3TargetDmsRole);

    // DMS Replication Instance
    const dmsReplicationInstance = new dms.CfnReplicationInstance(this, 'DMSReplicationInstance', {
      replicationInstanceClass: dmsInstanceClass.valueAsString,
      replicationInstanceIdentifier: dmsInstanceName.valueAsString,
      replicationSubnetGroupIdentifier: dmsReplicationSubnetGroup.ref,
      vpcSecurityGroupIds: [dmsSecurityGroup.valueAsString],
      multiAz: true,
      publiclyAccessible: false
    });
    

    //////////////////////////////////////////////////////////////////////////
    // Replicate data from Aurora to S3 with AWS Database Migration Service //
    //////////////////////////////////////////////////////////////////////////
    // Aurora Source Endpoint
    const auroraSourceEndpoint = new dms.CfnEndpoint(this, 'AuroraSourceEndpoint', {
      endpointType: 'source',
      engineName: 'aurora',
      username: cdk.Fn.sub('{{resolve:secretsmanager:${SecretsManagerSecretNameforAurora}:SecretString:username}}'),
      password: cdk.Fn.sub('{{resolve:secretsmanager:${SecretsManagerSecretNameforAurora}:SecretString:password}}'),
      port: 3306,
      serverName: serverName.valueAsString
    });
    auroraSourceEndpoint.node.addDependency(dmsReplicationInstance);

    // S3 Target Endpoint
    const s3TargetEndpoint = new dms.CfnEndpoint(this, 'S3TargetEndpoint', {
      endpointType: 'target',
      engineName: 's3',
      extraConnectionAttributes: 'addColumnName=true',
      s3Settings: {
        bucketName: bucketName.valueAsString,
        serviceAccessRoleArn: s3TargetDmsRole.roleArn
      }
    });
    s3TargetEndpoint.node.addDependency(dmsReplicationInstance);


    /////////////////////////////////////////////////////////////////////////////////
    // Replicate data from MySQL to PostgreSQL with AWS Database Migration Service //
    /////////////////////////////////////////////////////////////////////////////////
    // IAM role to access SecretsManager
    const secretsManagerAccessRoleForDatabases = new iam.Role(this, 'SecretsManagerAccessRoleForDatabases', {
      roleName: 'dms-secret-manager-access-role',
      assumedBy: new iam.ServicePrincipal(cdk.Fn.sub('dms.${AWS::Region}.amazonaws.com')),
      inlinePolicies: {
        SecretsManagerPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['kms:Decrypt', 'kms:DescribeKey'],
              resources: [
                kmsArnEncryptSecretForMySql.valueAsString,
                kmsArnEncryptSecretForPostgresql.valueAsString
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['secretsmanager:GetSecretValue'],
              resources: [
                secretsManagerMysqlArn.valueAsString,
                secretsManagerPostgresqlArn.valueAsString
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
        secretsManagerSecretId: secretsManagerMysqlArn.valueAsString
      }
    });
    mysqlSourceEndpoint.node.addDependency(dmsReplicationInstance);
 
    // PostgreSQL Target Endpoint
    const postgresqlTargetEndpoint = new dms.CfnEndpoint(this, 'PostgreSqlTargetEndpoint', {
      endpointType: 'target',
      engineName: 'postgres',
      databaseName: postgresqlDatabaseName.valueAsString,
      postgreSqlSettings: {
        secretsManagerAccessRoleArn: secretsManagerAccessRoleForDatabases.roleArn,
        secretsManagerSecretId: secretsManagerPostgresqlArn.valueAsString
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
