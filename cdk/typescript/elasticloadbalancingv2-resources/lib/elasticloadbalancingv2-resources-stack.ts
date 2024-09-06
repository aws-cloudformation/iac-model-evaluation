import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticloadbalancingv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
export interface ElasticLoadBalancingV2ResourcesStackProps extends cdk.StackProps {
  /**
   * CidrBlockForVPC
   * @default '186.0.0.0/24'
   */
  readonly cidrBlockForVpc?: string;
  /**
   * Cidr Block For Subnet1
   * @default '186.0.0.0/25'
   */
  readonly cidrBlockForSubnet1?: string;
  /**
   * Cidr Block For Subnet2
   * @default '186.0.0.128/25'
   */
  readonly cidrBlockForSubnet2?: string;
  /**
   * AvailabilityZone For Subnet1
   * @default 'us-east-1c'
   */
  readonly availabilityZoneForSubnet1?: string;
  /**
   * AvailabilityZone For Subnet2
   * @default 'us-east-1b'
   */
  readonly availabilityZoneForSubnet2?: string;
}

export class ElasticLoadBalancingV2ResourcesStack extends cdk.Stack {
  public readonly loadBalancer: elasticloadbalancingv2.ApplicationLoadBalancer;
  public readonly targetGroup1: elasticloadbalancingv2.ApplicationTargetGroup;
  public readonly targetGroup2: elasticloadbalancingv2.ApplicationTargetGroup;
  public readonly listenerArn: string;
  public readonly listenerRule1Arn: string;
  public readonly listenerRule2Arn: string;
  public readonly loadBalancersAssociatedWithTargetGroup1: string;
  public readonly loadBalancersAssociatedWithTargetGroup2: string;
  public readonly targetGroupFullName1: string;
  public readonly targetGroupFullName2: string;

  public constructor(scope: cdk.App, id: string, props: ElasticLoadBalancingV2ResourcesStackProps = {}) {
    super(scope, id, props);

    // Applying default props
    props = {
      ...props,
      cidrBlockForVpc: props.cidrBlockForVpc ?? '186.0.0.0/24',
      cidrBlockForSubnet1: props.cidrBlockForSubnet1 ?? '186.0.0.0/25',
      cidrBlockForSubnet2: props.cidrBlockForSubnet2 ?? '186.0.0.128/25',
      availabilityZoneForSubnet1: props.availabilityZoneForSubnet1 ?? 'us-east-1c',
      availabilityZoneForSubnet2: props.availabilityZoneForSubnet2 ?? 'us-east-1b',
    };

    // VPC related Resources
    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: props.cidrBlockForVpc!,
      maxAzs: 2, // Default is all AZs in the region
    });

    // Create Target Groups
    this.targetGroup1 = new elasticloadbalancingv2.ApplicationTargetGroup(this, 'TargetGroup1', {
      port: 1000,
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
      vpc: vpc,
      targetType: elasticloadbalancingv2.TargetType.INSTANCE,
    });

    this.targetGroup2 = new elasticloadbalancingv2.ApplicationTargetGroup(this, 'TargetGroup2', {
      port: 2000,
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
      vpc: vpc,
      targetType: elasticloadbalancingv2.TargetType.INSTANCE,
    });

    // Create Load Balancer
    this.loadBalancer = new elasticloadbalancingv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc: vpc,
      internetFacing: false, // Set to true for an internet-facing load balancer
    });

    // Create Listener
    const listener = this.loadBalancer.addListener('Listener', {
      port: 8000,
      protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
    });

    // Add default action to listener
    listener.addAction('DefaultAction', {
      action: elasticloadbalancingv2.ListenerAction.forward([this.targetGroup1]),
    });

    // Create Listener Rules
    listener.addAction('ListenerRule1', {
      priority: 1,
      conditions: [
        elasticloadbalancingv2.ListenerCondition.httpHeader('User-Agent', ['Mozilla']),
        elasticloadbalancingv2.ListenerCondition.httpHeader('Referer', ['https://www.amazon.com/']),
      ],
      action: elasticloadbalancingv2.ListenerAction.forward([this.targetGroup1]),
    });

    listener.addAction('ListenerRule2', {
      priority: 2,
      conditions: [
        elasticloadbalancingv2.ListenerCondition.httpHeader('User-Agent', ['Chrome']),
      ],
      action: elasticloadbalancingv2.ListenerAction.forward([this.targetGroup2]),
    });

    // Outputs
    new cdk.CfnOutput(this, 'CfnOutputLoadBalancer', {
      value: this.loadBalancer.loadBalancerArn,
      description: 'Load Balancer ARN',
    });

    new cdk.CfnOutput(this, 'CfnOutputTargetGroup1', {
      value: this.targetGroup1.targetGroupArn,
      description: 'Target Group 1 ARN',
    });

    new cdk.CfnOutput(this, 'CfnOutputTargetGroup2', {
      value: this.targetGroup2.targetGroupArn,
      description: 'Target Group 2 ARN',
    });

    this.listenerArn = listener.listenerArn;

    new cdk.CfnOutput(this, 'CfnOutputListenerArn', {
      value: this.listenerArn,
      description: 'Listener ARN',
    });

    this.loadBalancersAssociatedWithTargetGroup1 = this.targetGroup1.loadBalancerArns[0];

    new cdk.CfnOutput(this, 'CfnOutputLoadBalancersAssociatedWithTargetGroup1', {
      value: this.loadBalancersAssociatedWithTargetGroup1,
      description: 'Load Balancers associated with Target Group 1',
    });

    this.loadBalancersAssociatedWithTargetGroup2 = this.targetGroup2.loadBalancerArns[0];

    new cdk.CfnOutput(this, 'CfnOutputLoadBalancersAssociatedWithTargetGroup2', {
      value: this.loadBalancersAssociatedWithTargetGroup2,
      description: 'Load Balancers associated with Target Group 2',
    });

    this.targetGroupFullName1 = this.targetGroup1.targetGroupFullName;

    new cdk.CfnOutput(this, 'CfnOutputTargetGroupFullName1', {
      value: this.targetGroupFullName1,
      description: 'Full Name of Target Group 1',
    });

    this.targetGroupFullName2 = this.targetGroup2.targetGroupFullName;

    new cdk.CfnOutput(this, 'CfnOutputTargetGroupFullName2', {
      value: this.targetGroupFullName2,
      description: 'Full Name of Target Group 2',
    });
  }
}