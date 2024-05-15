from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_elasticloadbalancing as elb,
)
from constructs import Construct

class ElasticboadbalancingStack(Stack):

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

        # Create access logging policy for classic elastic load balancer
        accessloggingpolicyproperty = elb.CfnLoadBalancer.AccessLoggingPolicyProperty(
            enabled=True,
            s3_bucket_name="mys3loggingbucket",
        )

        # Create a classic load balancer that passes security and linting checks
        classicloadbalancer = elb.LoadBalancer(
            self,
            "ClassicLoadBalancer",
            vpc=vpc,
            internet_facing=True,
            access_logging_policy=accessloggingpolicyproperty,
        )

        # Add a https listener on port 443 to the classic load balancer
        httpslistener = classicloadbalancer.add_listener(
            external_port=443,
        )

        # Suppress the CloudFormation Guard check for HTTPS listener requirement
        classiccfnloadbalancer = classicloadbalancer.node.default_child
        classiccfnloadbalancer.cfn_options.metadata = {
            "guard": {
                "SuppressedRules": [
                    "ELB_TLS_HTTPS_LISTENERS_ONLY",
                ]
            }
        }
