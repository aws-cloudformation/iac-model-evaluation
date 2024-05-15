from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_elasticloadbalancingv2 as elbv2,
)
from constructs import Construct

class Elasticboadbalancingv2AlbStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

         # Create basic VPC with cidr block 10.0.0.0/16 in 2 AZs, no NAT Gateway
        vpc = ec2.Vpc(
            self,
            "VPC",
            ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16"),
            restrict_default_security_group=False,
            max_azs=2,
            nat_gateways=0,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    subnet_type=ec2.SubnetType.PUBLIC,
                    map_public_ip_on_launch=False,
                    cidr_mask=24,
                    name="Public"
                ),
                ec2.SubnetConfiguration(
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24,
                    name="Private"
                ),
            ],
        )

        # Suppress Cloudformation Guard check that does not apply to the default route of public subnets
        [Subnet1DefaultRoute] = vpc.node.try_find_child("PublicSubnet1").node.try_find_child("DefaultRoute").node.find_all()
        Subnet1DefaultRoute.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "NO_UNRESTRICTED_ROUTE_TO_IGW",
                ]
            }
        }

        # Suppress Cloudformation Guard check that does not apply to the default route of public subnets
        [Subnet2DefaultRoute] = vpc.node.try_find_child("PublicSubnet2").node.try_find_child("DefaultRoute").node.find_all()
        Subnet2DefaultRoute.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "NO_UNRESTRICTED_ROUTE_TO_IGW",
                ]
            }
        }

        # Create a classic load balancer that passes security and linting checks
        alb = elbv2.ApplicationLoadBalancer(
            self,
            "ApplicationLoadBalancer",
            vpc=vpc,
            internet_facing=True,
            drop_invalid_header_fields=True,
            deletion_protection=True,
        )

        # Redirect all HTTP traffic to HTTPS
        alb.add_redirect()

        # Suppress the CloudFormation Guard check for HTTPS listener requirement
        albcfn = alb.node.default_child
        albcfn.cfn_options.metadata = {
            "checkov": {
                "skip": [
                    {
                        "id": "CKV_AWS_91",
                        "comment": "Access Logs cannot be enabled for environment-agnostic stacks"
                    }
                ]
            }
        }

        # Suppress the CloudFormation Guard check for the security groups HTTPS listener requirement
        albsecuritygroupcfn = alb.node.try_find_child("SecurityGroup").node.default_child
        albsecuritygroupcfn.cfn_options.metadata = {
            "checkov": {
                "skip": [
                    {
                        "id": "CKV_AWS_260",
                        "comment": "ALB redirects all HTTP traffic to HTTPS"
                    }
                ]
            }
        }
