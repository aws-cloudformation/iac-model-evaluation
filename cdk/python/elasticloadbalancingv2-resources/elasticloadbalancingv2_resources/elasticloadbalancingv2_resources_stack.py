from aws_cdk import Stack
import aws_cdk as cdk
import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_elasticloadbalancingv2 as elasticloadbalancingv2
from constructs import Construct

class Elasticloadbalancingv2ResourcesStack(Stack):
  def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
    super().__init__(scope, construct_id, **kwargs)

    # Applying default props
    props = {
      'cidrBlockForVpc': kwargs.get('cidrBlockForVpc', '186.0.0.0/24'),
      'cidrBlockForSubnet1': kwargs.get('cidrBlockForSubnet1', '186.0.0.0/25'),
      'cidrBlockForSubnet2': kwargs.get('cidrBlockForSubnet2', '186.0.0.128/25'),
      'availabilityZoneForSubnet1': kwargs.get('availabilityZoneForSubnet1', 'us-east-1c'),
      'availabilityZoneForSubnet2': kwargs.get('availabilityZoneForSubnet2', 'us-east-1b'),
    }

    # Resources
    vpc = ec2.CfnVPC(self, 'VPC',
          cidr_block = props['cidrBlockForVpc'],
        )

    subnet1 = ec2.CfnSubnet(self, 'Subnet1',
          vpc_id = vpc.ref,
          availability_zone = props['availabilityZoneForSubnet1'],
          cidr_block = props['cidrBlockForSubnet1'],
        )

    subnet2 = ec2.CfnSubnet(self, 'Subnet2',
          vpc_id = vpc.ref,
          availability_zone = props['availabilityZoneForSubnet2'],
          cidr_block = props['cidrBlockForSubnet2'],
        )

    targetGroup1 = elasticloadbalancingv2.CfnTargetGroup(self, 'TargetGroup1',
          port = 1000,
          protocol = 'HTTP',
          vpc_id = vpc.ref,
        )

    targetGroup2 = elasticloadbalancingv2.CfnTargetGroup(self, 'TargetGroup2',
          port = 2000,
          protocol = 'HTTP',
          vpc_id = vpc.ref,
        )

    loadBalancer = elasticloadbalancingv2.CfnLoadBalancer(self, 'LoadBalancer',
          scheme = 'internal',
          subnets = [
            subnet1.ref,
            subnet2.ref,
          ],
        )

    listener = elasticloadbalancingv2.CfnListener(self, 'Listener',
          default_actions = [
            {
              'type': 'forward',
              'targetGroupArn': targetGroup1.ref,
            },
          ],
          load_balancer_arn = loadBalancer.ref,
          port = 8000,
          protocol = 'HTTP',
        )

    listenerRule1 = elasticloadbalancingv2.CfnListenerRule(self, 'ListenerRule1',
          actions = [
            {
              'type': 'forward',
              'targetGroupArn': targetGroup1.ref,
            },
          ],
          conditions = [
            {
              'field': 'http-header',
              'httpHeaderConfig': {
                'httpHeaderName': 'User-Agent',
                'values': [
                  'Mozilla',
                ],
              },
            },
            {
              'field': 'http-header',
              'httpHeaderConfig': {
                'httpHeaderName': 'Referer',
                'values': [
                  'https://www.amazon.com/',
                ],
              },
            },
          ],
          listener_arn = listener.ref,
          priority = 1,
        )

    listenerRule2 = elasticloadbalancingv2.CfnListenerRule(self, 'ListenerRule2',
          actions = [
            {
              'type': 'forward',
              'targetGroupArn': targetGroup2.ref,
            },
          ],
          conditions = [
            {
              'field': 'http-header',
              'httpHeaderConfig': {
                'httpHeaderName': 'User-Agent',
                'values': [
                  'Chrome',
                ],
              },
            },
          ],
          listener_arn = listener.ref,
          priority = 2,
        )

    # Outputs
    self.load_balancer = loadBalancer.ref
    cdk.CfnOutput(self, 'CfnOutputLoadBalancer', 
      key = 'LoadBalancer',
      value = str(self.load_balancer),
    )

    self.target_group1 = targetGroup1.ref
    cdk.CfnOutput(self, 'CfnOutputTargetGroup1', 
      key = 'TargetGroup1',
      value = str(self.target_group1),
    )

    self.target_group2 = targetGroup2.ref
    cdk.CfnOutput(self, 'CfnOutputTargetGroup2', 
      key = 'TargetGroup2',
      value = str(self.target_group2),
    )

    self.listener_arn = listener.ref
    cdk.CfnOutput(self, 'CfnOutputListenerArn', 
      key = 'ListenerArn',
      value = str(self.listener_arn),
    )

    self.listener_rule1_arn = listenerRule1.ref
    cdk.CfnOutput(self, 'CfnOutputListenerRule1Arn', 
      key = 'ListenerRule1Arn',
      value = str(self.listener_rule1_arn),
    )

    self.listener_rule2_arn = listenerRule2.ref
    cdk.CfnOutput(self, 'CfnOutputListenerRule2Arn', 
      key = 'ListenerRule2Arn',
      value = str(self.listener_rule2_arn),
    )

    """
      LoadBalancers associated with TargetGroup
    """
    self.load_balancers_associated_with_target_group1 = cdk.Fn.select(0, targetGroup1.attr_load_balancer_arns)
    cdk.CfnOutput(self, 'CfnOutputLoadBalancersAssociatedWithTargetGroup1', 
      key = 'LoadBalancersAssociatedWithTargetGroup1',
      description = 'LoadBalancers associated with TargetGroup',
      value = str(self.load_balancers_associated_with_target_group1),
    )

    """
      LoadBalancers associated with TargetGroup
    """
    self.load_balancers_associated_with_target_group2 = cdk.Fn.select(0, targetGroup2.attr_load_balancer_arns)
    cdk.CfnOutput(self, 'CfnOutputLoadBalancersAssociatedWithTargetGroup2', 
      key = 'LoadBalancersAssociatedWithTargetGroup2',
      description = 'LoadBalancers associated with TargetGroup',
      value = str(self.load_balancers_associated_with_target_group2),
    )

    """
      FullName of TargetGroup1
    """
    self.target_group_full_name1 = targetGroup1.attr_target_group_full_name
    cdk.CfnOutput(self, 'CfnOutputTargetGroupFullName1', 
      key = 'TargetGroupFullName1',
      description = 'FullName of TargetGroup1',
      value = str(self.target_group_full_name1),
    )

    """
      FullName of TargetGroup2
    """
    self.target_group_full_name2 = targetGroup2.attr_target_group_full_name
    cdk.CfnOutput(self, 'CfnOutputTargetGroupFullName2', 
      key = 'TargetGroupFullName2',
      description = 'FullName of TargetGroup2',
      value = str(self.target_group_full_name2),
    )



