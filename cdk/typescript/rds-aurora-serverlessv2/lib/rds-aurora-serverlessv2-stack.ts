import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
} from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Key } from 'aws-cdk-lib/aws-kms';
import { HostedRotation } from 'aws-cdk-lib/aws-secretsmanager';

export class RdsAuroraServerlessv2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create private VPC with cidr block 10.0.0.0/16
    const vpc = new Vpc(this, 'RdsVpc', {
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

    // Define a serverless Aurora database cluster writer instance
    const writer = rds.ClusterInstance.serverlessV2( "writer", {
      autoMinorVersionUpgrade: true,
    });

    // Define a serverless Aurora database cluster reader instance that scales with writer nodes
    const reader = rds.ClusterInstance.serverlessV2( "reader", {
      scaleWithWriter: true,
      autoMinorVersionUpgrade: true,
    });

    // Create Aurora Serverless V2 MySQL cluster with version 3.04.0 that passes security and linting checks
    const cluster = new rds.DatabaseCluster(this, 'AuroraDatabaseCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_04_0 }),
      writer: writer,
      readers: [
        reader,
      ],
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
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
