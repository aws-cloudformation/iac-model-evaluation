from aws_cdk import Stack
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_elasticloadbalancingv2 as elbv2
from constructs import Construct
from aws_cdk import aws_autoscaling as autoScalingGroup

class AlbStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create a VPC for the ALB
        # Specify the number of Availability Zones
        # Specify the number of NAT gateways
        vpc = ec2.Vpc(
            self,
            "CW-VPC",
            max_azs=2,  
            nat_gateways=1,  
        )

        # Create an Application Load Balancer
        # Set to True if the ALB is public-facing
        alb = elbv2.ApplicationLoadBalancer(
            self,
            "CW-ALB",
            vpc=vpc,
            internet_facing=True,  
        )

        # Define a target group
        # Specify the target port
        # Specify the health check path
        # Use the same port as the target
        target_group = elbv2.ApplicationTargetGroup(
            self,
            "CWTargetGroup",
            vpc=vpc,
            port=80,  
            protocol=elbv2.ApplicationProtocol.HTTP,
            health_check={
                "path": "/health", 
                "port": "traffic-port", 
            }
        )


        # Define a listener for the ALB
        # Specify the listener port
        listener = alb.add_listener(
            "CWListener",
            port=80,  
        )


        # Create an AutoScaling group
        # Specify the instance type
        # Use Amazon Linux 2 as the instance image
        # Specify the minimum number of instances
        # Specify the maximum number of instances
        asg = autoScalingGroup.AutoScalingGroup(
            self,
            "CW-AutoScalingGroup",
            vpc=vpc,
            instance_type=ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),  
            machine_image=ec2.AmazonLinuxImage(),  
            min_capacity=2,  
            max_capacity=5, 
        )



        # add it as a load balancing target to the listener.
        listener.add_targets("ApplicationFleet",
        port=8080,
        targets=[asg]
        )






