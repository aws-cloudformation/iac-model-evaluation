from constructs import Construct
from aws_cdk import (
    Stack,
    aws_docdb as docdb,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    aws_ec2 as ec2
)


class DocDBStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create private VPC with cidr block 10.0.0.0/16
        vpc = ec2.Vpc(self, "docdbvpc",
            ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            restrict_default_security_group=False,
            nat_gateways=0,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    cidr_mask=24,
                    name="private",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED
                ),
                ec2.SubnetConfiguration(
                    cidr_mask=24,
                    name="public",
                    subnet_type=ec2.SubnetType.PUBLIC
                )
            ]
        )

        # Create a custom DocDB cluster parameter group that enables TLS and auditing on cluster.
        parameter_group = docdb.ClusterParameterGroup(self, "CustomClusterParameterGroup",
            family="docdb5.0",
            parameters={
                "audit_logs": "enabled",
                "tls": "enabled",
                "profiler": "enabled"
            },
            db_cluster_parameter_group_name=f"{self.stack_name}-CustomClusterParameterGroup"
        )

        # Create a DocDB cluster with 2 DocDB instances
        cluster = docdb.DatabaseCluster(self, "Database",
            master_user=docdb.Login(
                username="myuser",  # note: 'admin' is reserved by DocumentDB
                exclude_characters='\"@/:',
                secret_name="/myapp/mydocdb/masteruser"
            ),
            db_cluster_name=f"{self.stack_name}-DocDBCluster",
            instances=2,
            instance_type=ec2.InstanceType.of(ec2.InstanceClass.MEMORY5, ec2.InstanceSize.LARGE),
            parameter_group=parameter_group,
            vpc=vpc,
            copy_tags_to_snapshot=True,
            exportProfilerLogsToCloudWatch=True,
            exportAuditLogsToCloudWatch=True
        )

        # Create a SNS topic and subscribe your Email to it. Replace xyz@domain.com with your Email ID. 
        sns_topic = sns.Topic(self, "Topic")
        my_email = "xyz@domain.com"
        sns_topic.add_subscription(subs.EmailSubscription(my_email))

        docdb.CfnEventSubscription(self, "MyCfnEventSubscription",
            sns_topic_arn=sns_topic.topic_arn,
            enabled=False,
            source_ids=[cluster.cluster_identifier],
            source_type="db-cluster",
            subscription_name=f"{self.stack_name}-EventSubscription"
        )
