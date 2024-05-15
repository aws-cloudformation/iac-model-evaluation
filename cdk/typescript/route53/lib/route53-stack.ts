import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Vpc,
  SubnetType,
  IpAddresses,
} from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class Route53Stack extends cdk.Stack {
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

    // Create a public hosted zone "mydomain.com"
    new route53.PublicHostedZone(this, 'route53PublicHostedZone', {
      zoneName: 'mydomain.com',
    });

    // Create a private hosted zone "local.mydomain.com" for the vpc
    new route53.PrivateHostedZone(this, 'route53PrivateHostedZone', {
      vpc: vpc,
      zoneName: 'local.mydomain.com',
    });

  }
}
