from aws_cdk import (
    Duration,
    Stack,
    aws_ec2 as ec2,
    aws_rds as rds,
    aws_kms as kms,
)
from constructs import Construct

class RdsOracleEeCdbStack(Stack):

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

        # Create username and password secret for RDS instance
        rdsusernamesecret = rds.DatabaseSecret(
            self,
            "RDSSecret",
            username="admin",
            encryption_key=kms.Key(
                self,
                "MySQL-EncryptionKey",
                enable_key_rotation=True,
                ),
        )

        # Create RDS Oracle EE CDB instance that passes linting and security checks
        rdsinstance = rds.DatabaseInstance(
            self,
            "RDS",
            engine=rds.DatabaseInstanceEngine.ORACLE_EE_CDB,
            deletion_protection=True,
            storage_encrypted=True,
            iam_authentication=True,
            monitoring_interval=Duration.seconds(60),
            credentials=rds.Credentials.from_secret(rdsusernamesecret),
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            multi_az=True,
            cloudwatch_logs_exports=["audit", "error", "general", "slowquery"],
            auto_minor_version_upgrade=True,
            backup_retention=Duration.days(1),
        )

        # Rotate master password for RDS instance
        rdsinstance.add_rotation_single_user()

        # Suppress the CloudFormation Guard Secrets Manager rotation check for the RDS instance username secret
        rdsusernamesecret.node.default_child.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "SECRETSMANAGER_ROTATION_ENABLED_CHECK",
                ]
            }
        }
