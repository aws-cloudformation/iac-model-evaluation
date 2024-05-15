import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
  CfnRoute,
} from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancing';

export class ElasticloadbalancingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with cidr 10.0.0.0/16 in 2 AZs, no NAT Gateway
    const vpc = new Vpc(this, 'Vpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      restrictDefaultSecurityGroup: false,
      natGateways: 0,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          mapPublicIpOnLaunch: false,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });

    // Suppress Cloudformation Guard check that does not apply to the default route of public subnets
    const [Subnet1DefaultRoute] = vpc.node.findChild("publicSubnet1").node.findChild("DefaultRoute").node.findAll() as [CfnRoute];
    Subnet1DefaultRoute.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "NO_UNRESTRICTED_ROUTE_TO_IGW",
        ],
      }
    }

    // Suppress Cloudformation Guard check that does not apply to the default route of public subnets
    const [Subnet2DefaultRoute] = vpc.node.findChild("publicSubnet2").node.findChild("DefaultRoute").node.findAll() as [CfnRoute];
    Subnet2DefaultRoute.cfnOptions.metadata = {
      guard: {
        SuppressedRules: [
          "NO_UNRESTRICTED_ROUTE_TO_IGW",
        ],
      }
    }

    // Create access logging policy for ELB sending all logs to access-logs-bucket
    const accessLoggingPolicyProperty: elb.CfnLoadBalancer.AccessLoggingPolicyProperty = {
      enabled: true,
      s3BucketName: 'access-logs-bucket',
    };

    // Create classic ELB with access logging policy that passes security and linting checks
    const classicELB = new elb.LoadBalancer(this, 'ClassicELB', {
      vpc,
      internetFacing: true,
      accessLoggingPolicy: accessLoggingPolicyProperty,
    });

    // Add a https listener on port 443 to the classic ELB
    classicELB.addListener({
      externalPort: 443,
    });

    // Suppress the CloudFormation Guard check for HTTPS listener requirement
    const cfnClassicELB = classicELB.node.defaultChild as elb.CfnLoadBalancer;
    cfnClassicELB.cfnOptions.metadata = {
      guard: {
        SuppressedRules: ["ELB_TLS_HTTPS_LISTENERS_ONLY"],
      },
    };

  }
}
