import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
  CfnRoute,
} from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';


export class Elasticloadbalancingv2NlbStack extends cdk.Stack {
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

    // Create NLB that passes security and linting checks
    const nlb = new elbv2.NetworkLoadBalancer(this, 'Nlb', {
      vpc: vpc,
      internetFacing: true,
      deletionProtection: true,
    });

    // Suppress the Checkov Check for access logging requirement
    const cfnNlb = nlb.node.defaultChild as elbv2.CfnLoadBalancer;
    cfnNlb.cfnOptions.metadata = {
      checkov: {
        skip: [
          {
            id: 'CKV_AWS_91',
            comment: 'Access logs cannot be enabled for environment-agnostic stacks',
          }
        ]
      }
    };

  }
}
