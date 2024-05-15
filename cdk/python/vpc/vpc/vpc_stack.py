from aws_cdk import (
    Stack,
    aws_ec2 as ec2
)
from constructs import Construct

class VpcStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # define an AWS VPC with a cidr 10.0.0.0/16
        vpc = ec2.Vpc(self,"MyVpc",
            ip_addresses = ec2.IpAddresses.cidr("10.0.0.0/16")
            )
