from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_efs as efs,
)
from constructs import Construct

class EfsStack(Stack):

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
                    name="RDS"
                ),
            ],
        )

        # Create EFS file system that passes security and linting checks
        filesystem = efs.FileSystem(
            self,
            "FileSystem",
            vpc=vpc,
            enable_automatic_backups=True,   
        )
