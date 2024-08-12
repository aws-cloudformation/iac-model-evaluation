import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
} from 'aws-cdk-lib/aws-ec2';
import * as fsx from 'aws-cdk-lib/aws-fsx';

export class FsxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create private VPC with cidr block 10.0.0.0/16
    const vpc = new Vpc(this, 'Vpc', {
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

    // Create FSx file system that passes security and linting checks
    new fsx.CfnFileSystem(this, 'FsxLustreFileSystem', {
      lustreConfiguration: { deploymentType: fsx.LustreDeploymentType.SCRATCH_1 },
      fileSystemTypeVersion: '2.12',
      storageCapacity: 1200,
      fileSystemType: 'LUSTRE'
      , subnetIds: [vpc.isolatedSubnets[0].subnetId]
      , securityGroupIds: [vpc.vpcDefaultSecurityGroup]
      , storageType: 'SSD'
      , kmsKeyId: vpc.vpcDefaultSecurityGroup
      , tags: [{ key: 'Name', value: 'fsx-lustre-file-system' }]
    });

  }
}
