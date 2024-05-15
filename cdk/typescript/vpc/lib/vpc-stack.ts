import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create AWS Custom VPC in your account default region for a 3-Tier Architecture 
    const vpc = new ec2.Vpc(this, 'MyVPC', {
      vpcName: 'MyVPC',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs:3,
      natGateways: 1,
      createInternetGateway: true,
      subnetConfiguration: [
        { cidrMask: 24, 
          name: 'public-subnet-public-tier', 
          subnetType: ec2.SubnetType.PUBLIC,       
        },
        {cidrMask: 24, 
          name: 'private-subnet-app-tier', 
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {cidrMask: 24, 
          name: 'private-subnet-db-tier', 
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ],

    })
  }
}
