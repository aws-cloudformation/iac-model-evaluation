from constructs import Construct
from aws_cdk import (
    Duration,
    Stack,
    aws_imagebuilder as imagebuilder,
    aws_iam as iam,
)
import os


class ImageBuilderStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Creating a custom component by using a sample document definition present inside the imagebuilder-components directory
        with open(os.path.join('imagebuilder-components', 'component-data.yaml'), 'r') as file:
            component_data = file.read()
        
        cfnComponent = imagebuilder.CfnComponent(self, "MyCfnComponent",
            name = "sample-component",
            platform = "Linux",
            version = "1.0.0",
            data = component_data
        )

        # Creating Image Recipe where we are using the custom component created above and an AWS-managed component
        cfnImageRecipe = imagebuilder.CfnImageRecipe(self, "MyCfnImageRecipe",
            components = [
                imagebuilder.CfnImageRecipe.ComponentConfigurationProperty(
                    component_arn=f"arn:aws:imagebuilder:{self.region}:{self.account}:component/{cfnComponent.attr_name}/x.x.x",
                ),
                imagebuilder.CfnImageRecipe.ComponentConfigurationProperty(
                    component_arn=f"arn:aws:imagebuilder:{self.region}:aws:component/chrony-time-configuration-test/x.x.x",
                ),
            ],
            name = "sample-recipe",
            parent_image = f"arn:aws:imagebuilder:{self.region}:aws:image/amazon-linux-2-ecs-optimized-x86/x.x.x",
            version = "1.0.0",
            block_device_mappings = [imagebuilder.CfnImageRecipe.InstanceBlockDeviceMappingProperty(
                device_name = "/dev/xvda",
                ebs=imagebuilder.CfnImageRecipe.EbsInstanceBlockDeviceSpecificationProperty(
                    delete_on_termination=True,
                    encrypted=False,
                    volume_size=30,
                    volume_type="gp2"
                )
            )],
            working_directory = "/tmp"
        )

        # Creating IAM Instance Profile to be used by the Infrastructure configuration
        iamRoleImageBuilder = iam.Role(self, "IAMRoleImageBuilder",
            assumed_by = iam.ServicePrincipal('ec2.amazonaws.com'),
            managed_policies = [
                iam.ManagedPolicy.from_aws_managed_policy_name("AdministratorAccess")
            ]
        )

        iamInstanceProfileRoleImageBuilder = iam.InstanceProfile(self, "IAMInstanceProfileRoleImageBuilder",
            role = iamRoleImageBuilder
        )

        # Creating Infrastructure Configuration
        cfnInfrastructureConfiguration = imagebuilder.CfnInfrastructureConfiguration(self, "MyCfnInfrastructureConfiguration",
            instance_profile_name = iamInstanceProfileRoleImageBuilder.instance_profile_name,
            name = "sample-infra-configuration",
            terminate_instance_on_failure = True
        )


        # Creating Distribution Configuration to distribute the AMI to us-west-2 region of same account.
        cfnDistributionConfiguration = imagebuilder.CfnDistributionConfiguration(self, "MyCfnDistributionConfiguration",
            distributions = [
                imagebuilder.CfnDistributionConfiguration.DistributionProperty(
                    region = "us-west-2",
                    ami_distribution_configuration = {
                        'LaunchPermissionConfiguration': {
                            'UserIds': [f"{self.account}"]
                        }
                    }
                )
            ],
            name = "sample-distribution-configuration"
        )

        # Creating ImageBuilder Pipeline
        cfnImagePipeline = imagebuilder.CfnImagePipeline(self, 'MyCfnImagePipeline',
            name = "sample-image-pipeline",
            infrastructure_configuration_arn = cfnInfrastructureConfiguration.attr_arn,
            distribution_configuration_arn = cfnDistributionConfiguration.attr_arn,
            enhanced_image_metadata_enabled = False,
            image_recipe_arn = cfnImageRecipe.attr_arn,
            image_scanning_configuration = imagebuilder.CfnImagePipeline.ImageScanningConfigurationProperty(image_scanning_enabled=True),
            image_tests_configuration = imagebuilder.CfnImagePipeline.ImageTestsConfigurationProperty(image_tests_enabled=True),
            schedule = imagebuilder.CfnImagePipeline.ScheduleProperty(
                pipeline_execution_start_condition="EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE",
                schedule_expression="cron(0 9 * * ?)"
            ),
            status = "ENABLED"
        )

        # Creating IAM role to be used by the ImageBuilder LifecyclePolicy
        iamRoleForLifeCyclePolicy = iam.Role(self, 'MyIamRoleForLifeCyclePolicy',
            assumed_by = iam.ServicePrincipal('imagebuilder.amazonaws.com'),
            managed_policies = [
                iam.ManagedPolicy.from_aws_managed_policy_name("AdministratorAccess")
            ]
        )

        # Creating ImageBuilder LifecyclePolicy
        cfnLifecyclePolicy = imagebuilder.CfnLifecyclePolicy(self, 'MyCfnLifecyclePolicy',
            execution_role = iamRoleForLifeCyclePolicy.role_arn,
            name = "sample-lifecycle-policy",
            status = "ENABLED",
            resource_type = "AMI_IMAGE",
            resource_selection = imagebuilder.CfnLifecyclePolicy.ResourceSelectionProperty(
                tag_map={
                    "Environment": "Dev"
                }
            ),
            policy_details = [imagebuilder.CfnLifecyclePolicy.PolicyDetailProperty(
                action=imagebuilder.CfnLifecyclePolicy.ActionProperty(
                    type="DEPRECATE",

                    # the properties below are optional
                    include_resources=imagebuilder.CfnLifecyclePolicy.IncludeResourcesProperty(
                        amis=True
                    )
                ),
                filter=imagebuilder.CfnLifecyclePolicy.FilterProperty(
                    type="AGE",
                    value=6,
                    unit="MONTHS"
                ))
            ],
        )
    
        # Creating ImageBuilder Workflow using a sample document definition present inside the imagebuilder-components directory
        with open(os.path.join('imagebuilder-components', 'workflow-data.yaml'), 'r') as file:
                workflow_data = file.read()

        cfnWorkflow = imagebuilder.CfnWorkflow(self, "MyCfnWorkflow",
            name = "sample-workflow",
            type = "BUILD",
            version = "1.0.0",
            data = workflow_data
        )

