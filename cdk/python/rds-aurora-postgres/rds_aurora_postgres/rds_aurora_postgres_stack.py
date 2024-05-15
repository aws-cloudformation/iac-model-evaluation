from aws_cdk import (
    Duration,
    Stack,
    aws_rds as rds,
    aws_ec2 as ec2,
    aws_kms as kms,
)
from constructs import Construct

class RdsAuroraPostgresStack(Stack):

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

        # Create Aurora cluster writer instance
        aurora_writer=rds.ClusterInstance.provisioned(
            "writer",
            instance_type=ec2.InstanceType("t2.micro"),
            auto_minor_version_upgrade=True,
        )

        # Create Aurora cluster reader instance
        aurora_readers=[
            rds.ClusterInstance.provisioned(
            "reader",
            instance_type=ec2.InstanceType("t2.micro"),
            auto_minor_version_upgrade=True,
            ),
        ]

        # Create Aurora PostgreSQL cluster with version 15.3 that passes security and linting checks
        aurora_cluster = rds.DatabaseCluster(
            self,
            "AuroraCluster",
            engine=rds.DatabaseClusterEngine.aurora_postgres(version=rds.AuroraPostgresEngineVersion.VER_15_3),
            writer=aurora_writer,
            readers=aurora_readers,
            backup=rds.BackupProps(
                retention=Duration.days(1),
            ),
            credentials=rds.Credentials.from_secret(rdsusernamesecret),
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_ISOLATED),
            backtrack_window=Duration.seconds(30),
            cloudwatch_logs_exports=["postgresql"],
            monitoring_interval=Duration.seconds(5),
            iam_authentication=True,
            storage_encrypted=True,
            storage_encryption_key=kms.Key(
                self,
                "AuroraStorageEncryptionKey",
                enable_key_rotation=True,
            ),
            deletion_protection=True,
        )

        rdsusernamesecret.node.default_child.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "SECRETSMANAGER_ROTATION_ENABLED_CHECK"
                ]
            }
        }

        # Suppress Cloudformation Guard settings that do not apply to Aurora Cluster Instances, inherited from
        # the Aurora Database Cluster Properties
        aurora_cluster.node.find_child("writer").node.default_child.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "DB_INSTANCE_BACKUP_ENABLED",
                    "RDS_STORAGE_ENCRYPTED",
                    "RDS_INSTANCE_LOGGING_ENABLED",
                    "RDS_INSTANCE_DELETION_PROTECTION_ENABLED",
                    "RDS_SNAPSHOT_ENCRYPTED",
                    "RDS_MULTI_AZ_SUPPORT",
                ]
            }
        }

        # Suppress Cloudformation Guard settings that do not apply to Aurora Cluster Instances, inherited from
        # the Aurora Database Cluster Properties
        aurora_cluster.node.find_child("reader").node.default_child.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "DB_INSTANCE_BACKUP_ENABLED",
                    "RDS_STORAGE_ENCRYPTED",
                    "RDS_INSTANCE_LOGGING_ENABLED",
                    "RDS_INSTANCE_DELETION_PROTECTION_ENABLED",
                    "RDS_SNAPSHOT_ENCRYPTED",
                    "RDS_MULTI_AZ_SUPPORT",
                ]
            }
        }

