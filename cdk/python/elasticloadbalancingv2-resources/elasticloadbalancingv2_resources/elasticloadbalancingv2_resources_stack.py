from aws_cdk import Stack, CfnOutput
import aws_cdk as cdk
import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_elasticloadbalancingv2 as elasticloadbalancingv2
from constructs import Construct

class ElasticLoadBalancingV2ResourcesStack(Stack):
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

        # VPC related Resources
        vpc = ec2.Vpc(self, 'VPC',
            ip_addresses=ec2.IpAddresses.cidr(props['cidrBlockForVpc']),
            max_azs=2  # Default is all AZs in the region
        )

        # Create Target Groups
        target_group1 = elasticloadbalancingv2.ApplicationTargetGroup(self, 'TargetGroup1',
            port=1000,
            protocol=elasticloadbalancingv2.ApplicationProtocol.HTTP,
            vpc=vpc,
            target_type=elasticloadbalancingv2.TargetType.INSTANCE
        )

        target_group2 = elasticloadbalancingv2.ApplicationTargetGroup(self, 'TargetGroup2',
            port=2000,
            protocol=elasticloadbalancingv2.ApplicationProtocol.HTTP,
            vpc=vpc,
            target_type=elasticloadbalancingv2.TargetType.INSTANCE
        )

        # Create Load Balancer
        load_balancer = elasticloadbalancingv2.ApplicationLoadBalancer(self, 'LoadBalancer',
            vpc=vpc,
            internet_facing=False  # Set to True for internet-facing load balancer
        )

        # Create Listener
        listener = load_balancer.add_listener
