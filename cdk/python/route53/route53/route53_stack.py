from aws_cdk import (
    Stack,
    aws_route53 as route53,
    aws_ec2 as ec2,
)
from constructs import Construct

class Route53Stack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create basic VPC with cidr block 10.0.0.0/16
        vpc = ec2.Vpc(
            self,
            "VPC",
            ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            restrict_default_security_group=False,
            max_azs=2,
            nat_gateways=0,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24,
                    name="PrivateSubnet"
                ),
            ],
        )

        # Create a public hosted zone
        hosted_zone = route53.PublicHostedZone(
            self,
            "PublicHostedZone",
            zone_name="mytest.domain.com",
        )

        # Create a private hosted zone
        private_hosted_zone = route53.PrivateHostedZone(
            self,
            "PrivateHostedZone",
            zone_name="private.mytest.domain.com",
            vpc=vpc,
        )

