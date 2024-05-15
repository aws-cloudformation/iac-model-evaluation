from aws_cdk import (
    Stack,
    aws_iam as iam,
)
from constructs import Construct

class IamStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create IAM User
        user = iam.User(
            self,
            "testuser",
            user_name="testuser",
        )

        # Create Admin IAM group
        group = iam.Group(
            self,
            "admin-group",
            group_name="Admin group",
            managed_policies=[iam.ManagedPolicy.from_aws_managed_policy_name("AdministratorAccess")],
        )

        # Add Created IAM User to Created Admin Group
        group.add_user(user)

        # Create IAM Service Role for Lambda
        role = iam.Role(
            self,
            "lambda-role",
            role_name="lambda-role",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
        )

        # Attach AWS managed policy for AmazonS3ObjectLambdaExecutionRolePolicy
        role.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3ObjectLambdaExecutionRolePolicy"))

        # Create and Instance Profile
        instance_profile = iam.InstanceProfile(
            self,
            "ec2instanceprofile",
            role=iam.Role(
                self,
                "ec2instanceprofilerole",
                assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
            ),
            instance_profile_name="MyEC2InstanceProfile",
        )

        # Import instance profile by name
        imported_instance_profile = iam.InstanceProfile.from_instance_profile_name(
            self,
            "ImportedInstanceProfile",
            instance_profile_name="MyExistingInstanceProfile",
        )