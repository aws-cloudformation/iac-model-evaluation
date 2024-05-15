import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
  InstanceType,
  InstanceClass,
  InstanceSize,
} from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Key } from 'aws-cdk-lib/aws-kms';
import { HostedRotation } from 'aws-cdk-lib/aws-secretsmanager';

export class RdsAuroraMysqlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create private VPC with cidr block 10.0.0.0/16
    const vpc = new Vpc(this, 'RdsAuroraMysqlVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      restrictDefaultSecurityGroup: false,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });

    // Create username and password secret for DB Cluster
    const secret = new rds.DatabaseSecret(this, 'RdsSecret', {
      username: 'admin',
      encryptionKey: new Key(this, "DBEncryptionKey", {
        enableKeyRotation: true,
      }),
    });

    // Add Rotation schedule to DB Cluster secret
    secret.addRotationSchedule('RotationSchedule', {
      automaticallyAfter: cdk.Duration.days(30),
      hostedRotation: HostedRotation.mysqlSingleUser(),
    });

    // Define t3.medium Aurora database cluster writer instance
    const writer = rds.ClusterInstance.provisioned( "writer", {
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      autoMinorVersionUpgrade: true,
    });

    // Define t3.medium Aurora database cluster reader instance
    const reader = rds.ClusterInstance.provisioned( "reader", {
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      autoMinorVersionUpgrade: true,
    });

    // Create Aurora MySQL cluster with version 2.11.3 that passes security and linting checks
    const cluster = new rds.DatabaseCluster(this, 'AuroraDatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_11_3 }),
      writer: writer,
      readers: [
        reader,
      ],
      vpc: vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromSecret(secret),
      iamAuthentication: true,
      backtrackWindow: cdk.Duration.seconds(30),
      monitoringInterval: cdk.Duration.seconds(5),
      storageEncrypted: true,
    });

    // Suppress CloudFormation Guard checks that are inherited from the Aurora Cluster and 
    // do not apply to individual Aurora Cluster Instances.
    const cfnWriter = cluster.node.findChild("writer").node.defaultChild as rds.CfnDBInstance;
    cfnWriter.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "DB_INSTANCE_BACKUP_ENABLED",
          "RDS_STORAGE_ENCRYPTED",
          "RDS_INSTANCE_LOGGING_ENABLED",
          "RDS_INSTANCE_DELETION_PROTECTION_ENABLED",
          "RDS_SNAPSHOT_ENCRYPTED",
          "RDS_MULTI_AZ_SUPPORT",
        ],
      }
    };

    // Suppress CloudFormation Guard checks that are inherited from the Aurora Cluster and 
    // do not apply to individual Aurora Cluster Instances.
    const cfnReader = cluster.node.findChild("reader").node.defaultChild as rds.CfnDBInstance;
    cfnReader.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "DB_INSTANCE_BACKUP_ENABLED",
          "RDS_STORAGE_ENCRYPTED",
          "RDS_INSTANCE_LOGGING_ENABLED",
          "RDS_INSTANCE_DELETION_PROTECTION_ENABLED",
          "RDS_SNAPSHOT_ENCRYPTED",
          "RDS_MULTI_AZ_SUPPORT",
        ],
      }
    };

  }
}
