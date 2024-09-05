import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticloadbalancingv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface Elasticloadbalancingv2ResourcesStackProps extends cdk.StackProps {
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

export class Elasticloadbalancingv2ResourcesStack extends cdk.Stack {
  public readonly loadBalancer;
  public readonly targetGroup1;
  public readonly targetGroup2;
  public readonly listenerArn;
  public readonly listenerRule1Arn;
  public readonly listenerRule2Arn;
  /**
   * LoadBalancers associated with TargetGroup
   */
  public readonly loadBalancersAssociatedWithTargetGroup1;
  /**
   * LoadBalancers associated with TargetGroup
   */
  public readonly loadBalancersAssociatedWithTargetGroup2;
  /**
   * FullName of TargetGroup1
   */
  public readonly targetGroupFullName1;
  /**
   * FullName of TargetGroup2
   */
  public readonly targetGroupFullName2;

  public constructor(scope: cdk.App, id: string, props: Elasticloadbalancingv2ResourcesStackProps = {}) {
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

    // Resources
    const vpc = new ec2.CfnVPC(this, 'VPC', {
      cidrBlock: props.cidrBlockForVpc!,
    });

    const subnet1 = new ec2.CfnSubnet(this, 'Subnet1', {
      vpcId: vpc.ref,
      availabilityZone: props.availabilityZoneForSubnet1!,
      cidrBlock: props.cidrBlockForSubnet1!,
    });

    const subnet2 = new ec2.CfnSubnet(this, 'Subnet2', {
      vpcId: vpc.ref,
      availabilityZone: props.availabilityZoneForSubnet2!,
      cidrBlock: props.cidrBlockForSubnet2!,
    });

    const targetGroup1 = new elasticloadbalancingv2.CfnTargetGroup(this, 'TargetGroup1', {
      port: 1000,
      protocol: 'HTTP',
      vpcId: vpc.ref,
    });

    const targetGroup2 = new elasticloadbalancingv2.CfnTargetGroup(this, 'TargetGroup2', {
      port: 2000,
      protocol: 'HTTP',
      vpcId: vpc.ref,
    });

    const loadBalancer = new elasticloadbalancingv2.CfnLoadBalancer(this, 'LoadBalancer', {
      scheme: 'internal',
      subnets: [
        subnet1.ref,
        subnet2.ref,
      ],
    });

    const listener = new elasticloadbalancingv2.CfnListener(this, 'Listener', {
      defaultActions: [
        {
          type: 'forward',
          targetGroupArn: targetGroup1.ref,
        },
      ],
      loadBalancerArn: loadBalancer.ref,
      port: 8000,
      protocol: 'HTTP',
    });

    const listenerRule1 = new elasticloadbalancingv2.CfnListenerRule(this, 'ListenerRule1', {
      actions: [
        {
          type: 'forward',
          targetGroupArn: targetGroup1.ref,
        },
      ],
      conditions: [
        {
          field: 'http-header',
          httpHeaderConfig: {
            httpHeaderName: 'User-Agent',
            values: [
              'Mozilla',
            ],
          },
        },
        {
          field: 'http-header',
          httpHeaderConfig: {
            httpHeaderName: 'Referer',
            values: [
              'https://www.amazon.com/',
            ],
          },
        },
      ],
      listenerArn: listener.ref,
      priority: 1,
    });

    const listenerRule2 = new elasticloadbalancingv2.CfnListenerRule(this, 'ListenerRule2', {
      actions: [
        {
          type: 'forward',
          targetGroupArn: targetGroup2.ref,
        },
      ],
      conditions: [
        {
          field: 'http-header',
          httpHeaderConfig: {
            httpHeaderName: 'User-Agent',
            values: [
              'Chrome',
            ],
          },
        },
      ],
      listenerArn: listener.ref,
      priority: 2,
    });

    // Outputs
    this.loadBalancer = loadBalancer.ref;
    new cdk.CfnOutput(this, 'CfnOutputLoadBalancer', {
      key: 'LoadBalancer',
      value: this.loadBalancer!.toString(),
    });
    this.targetGroup1 = targetGroup1.ref;
    new cdk.CfnOutput(this, 'CfnOutputTargetGroup1', {
      key: 'TargetGroup1',
      value: this.targetGroup1!.toString(),
    });
    this.targetGroup2 = targetGroup2.ref;
    new cdk.CfnOutput(this, 'CfnOutputTargetGroup2', {
      key: 'TargetGroup2',
      value: this.targetGroup2!.toString(),
    });
    this.listenerArn = listener.ref;
    new cdk.CfnOutput(this, 'CfnOutputListenerArn', {
      key: 'ListenerArn',
      value: this.listenerArn!.toString(),
    });
    this.listenerRule1Arn = listenerRule1.ref;
    new cdk.CfnOutput(this, 'CfnOutputListenerRule1Arn', {
      key: 'ListenerRule1Arn',
      value: this.listenerRule1Arn!.toString(),
    });
    this.listenerRule2Arn = listenerRule2.ref;
    new cdk.CfnOutput(this, 'CfnOutputListenerRule2Arn', {
      key: 'ListenerRule2Arn',
      value: this.listenerRule2Arn!.toString(),
    });
    this.loadBalancersAssociatedWithTargetGroup1 = cdk.Fn.select(0, targetGroup1.attrLoadBalancerArns);
    new cdk.CfnOutput(this, 'CfnOutputLoadBalancersAssociatedWithTargetGroup1', {
      key: 'LoadBalancersAssociatedWithTargetGroup1',
      description: 'LoadBalancers associated with TargetGroup',
      value: this.loadBalancersAssociatedWithTargetGroup1!.toString(),
    });
    this.loadBalancersAssociatedWithTargetGroup2 = cdk.Fn.select(0, targetGroup2.attrLoadBalancerArns);
    new cdk.CfnOutput(this, 'CfnOutputLoadBalancersAssociatedWithTargetGroup2', {
      key: 'LoadBalancersAssociatedWithTargetGroup2',
      description: 'LoadBalancers associated with TargetGroup',
      value: this.loadBalancersAssociatedWithTargetGroup2!.toString(),
    });
    this.targetGroupFullName1 = targetGroup1.attrTargetGroupFullName;
    new cdk.CfnOutput(this, 'CfnOutputTargetGroupFullName1', {
      key: 'TargetGroupFullName1',
      description: 'FullName of TargetGroup1',
      value: this.targetGroupFullName1!.toString(),
    });
    this.targetGroupFullName2 = targetGroup2.attrTargetGroupFullName;
    new cdk.CfnOutput(this, 'CfnOutputTargetGroupFullName2', {
      key: 'TargetGroupFullName2',
      description: 'FullName of TargetGroup2',
      value: this.targetGroupFullName2!.toString(),
    });
  }
}
