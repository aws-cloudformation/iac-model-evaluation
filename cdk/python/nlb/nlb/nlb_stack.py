from aws_cdk import Stack
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_elasticloadbalancingv2 as elbv2
from constructs import Construct
from aws_cdk import aws_autoscaling as autoScalingGroup

class NlbStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create a VPC for the NLB
        # Specify the number of Availability Zones
        # Specify the number of NAT gateways
        vpc = ec2.Vpc(
            self,
            "CW-Vpc",
            max_azs=2,  
            nat_gateways=1,  
        )

        # Create a Network Load Balancer
        # Set to True if the NLB is public-facing
        nlb = elbv2.NetworkLoadBalancer(
            self,
            "CW-NLB",
            vpc=vpc,
            internet_facing=True,  
        )

        # Define a target group
        # Specify the target port
        # Specify the protocol (TCP or UDP)
        # Specify a name for the target group
        target_group = elbv2.NetworkTargetGroup(
            self,
            "CW-TargetGroup",
            vpc=vpc,
            port=80,  
            protocol=elbv2.Protocol.TCP, 
            target_group_name="CW-NLB-TargetGroupName", 
        )

        # Define a listener for the NLB
        # Specify the listener port
        listener = nlb.add_listener(
            "CW-Listener",
            port=80, 
            default_target_groups=[target_group],
        )

        