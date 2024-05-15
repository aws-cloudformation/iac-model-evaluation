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

export class RdsMysqlStack extends cdk.Stack {
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

    // Create RDS MySQL DB Instance that passes linting and security checks
    new rds.DatabaseInstance(this, 'RdsMysql', {
      engine: rds.DatabaseInstanceEngine.MYSQL,
      vpc: vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromSecret(secret),
      iamAuthentication: true,
      multiAz: true,
      monitoringInterval: cdk.Duration.seconds(60),
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(1),
      autoMinorVersionUpgrade: true,
      deletionProtection: true,
      cloudwatchLogsExports: ['audit','error', 'general', 'slowquery'],
    });

  }
}
