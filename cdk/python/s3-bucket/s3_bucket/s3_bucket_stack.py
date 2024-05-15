from aws_cdk import (
    Duration,
    Stack,
    RemovalPolicy,
    aws_s3,
    aws_iam,
)
from constructs import Construct

class S3BucketStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 bucket that passes linting and security checks
        mys3bucket = aws_s3.Bucket(
            self,
            'testing-bucket-cw-iac-examples',
            bucket_name = 'testing-bucket-cw-iac-examples',
            block_public_access=aws_s3.BlockPublicAccess.BLOCK_ALL,
            versioned=True,
            server_access_logs_prefix="s3-python-access-logs",
            encryption=aws_s3.BucketEncryption.S3_MANAGED,
            enforce_ssl=True,
            object_lock_enabled=True,
            removal_policy=RemovalPolicy.RETAIN,
            lifecycle_rules = [
                aws_s3.LifecycleRule(
                    id = "abortIncompleteUploads",
                    abort_incomplete_multipart_upload_after=Duration.days(1)
                )
            ]
        )

        # Suppress the CloudFormation Guard check for SSL requirement
        # "enabled_ssl=True" is set on the source S3 bucket
        mys3cfnbucketpolicy = mys3bucket.policy.node.default_child
        mys3cfnbucketpolicy.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "S3_BUCKET_SSL_REQUESTS_ONLY",
                ]
            }
        }

        # A bucket that is used as a target for replicas from the main source bucket
        mys3destinationbucket = aws_s3.Bucket(
            self,
            'testing-bucket-cw-iac-examples-destination',
            bucket_name = 'testing-bucket-cw-iac-examples-destination',
            block_public_access=aws_s3.BlockPublicAccess.BLOCK_ALL,
            versioned=True,
            encryption=aws_s3.BucketEncryption.S3_MANAGED,
            enforce_ssl=True,
            removal_policy=RemovalPolicy.RETAIN,
            lifecycle_rules = [
                aws_s3.LifecycleRule(
                    id = "abortIncompleteUploads",
                    abort_incomplete_multipart_upload_after=Duration.days(1)
                )
            ]
        )

        # Reference the L1 CfnBucket for the S3 target bucket to suppress certain checks
        mys3destinationcfnbucket = mys3destinationbucket.node.default_child
        # Suppress unnecessary checks in cfn-guard and checkov
        mys3destinationcfnbucket.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "S3_BUCKET_DEFAULT_LOCK_ENABLED",
                    "S3_BUCKET_REPLICATION_ENABLED",
                    "S3_BUCKET_LOGGING_ENABLED",
                ]
            },
            "checkov": {
                "skip": [
                    {
                        "id": "CKV_AWS_18",
                        "comment": "This is a destination bucket"
                    }
                ]
            }
        }

        # Suppress the CloudFormation Guard check for SSL requirement
        # "enabled_ssl=True" is set on the target S3 bucket
        mys3destinationcfnbucketpolicy = mys3destinationbucket.policy.node.default_child
        mys3destinationcfnbucketpolicy.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "S3_BUCKET_SSL_REQUESTS_ONLY",
                ]
            }
        }

        # Create an IAM role to be used for bucket replication
        new_replication_role = aws_iam.Role(
            self,
            'replication-role',
            assumed_by=aws_iam.ServicePrincipal('s3.amazonaws.com'),
            path="/service-role/",
        )

        # Add required IAM policies to replication role
        new_replication_role.add_to_policy(
            aws_iam.PolicyStatement(
                resources=[mys3bucket.bucket_arn],
                actions=[
                    "s3:GetReplicationConfiguration",
                    "s3:ListBucket",
                ],
            )
        )

        # Add required IAM policies to access source bucket contents to replication role
        new_replication_role.add_to_policy(
            aws_iam.PolicyStatement(
                resources=[mys3bucket.arn_for_objects("*")],
                actions=[
                    "s3:GetObjectVersion",
                    "s3:GetObjectVersionAcl",
                    "s3:GetObjectVersionTagging",
                    "s3:GetObjectVersionForReplication",
                    "s3:GetObjectLegalHold",
                    "s3:GetObjectVersionTagging",
                    "s3:GetObjectRetention",
                ]
            )
        )

        # Add required IAM policies to access replication target bucket contents to
        # replication role
        new_replication_role.add_to_policy(
            aws_iam.PolicyStatement(
                resources=[mys3destinationbucket.arn_for_objects("*")],
                actions=[
                    "s3:ReplicateObject",
                    "s3:ReplicateDelete",
                    "s3:ReplicateTags",
                    "s3:GetObjectVersionTagging",
                    "s3:ObjectOwnerOverrideToBucketOwner",
                ]
            )
        )

        # Use a CDK escape hatch for the source S3 bucket
        mys3cfnbucket = mys3bucket.node.default_child
        # Update the Replication Configuration property directly on the source bucket
        # to copy contents to the target bucket
        mys3cfnbucket.replication_configuration = mys3cfnbucket.ReplicationConfigurationProperty(
            role=new_replication_role.role_arn,
            rules=[
                aws_s3.CfnBucket.ReplicationRuleProperty(
                    id="replication-rule-1",
                    destination=aws_s3.CfnBucket.ReplicationDestinationProperty(
                        bucket=mys3destinationbucket.bucket_arn,
                    ),
                    status='Enabled',
                ),
            ],
        )
