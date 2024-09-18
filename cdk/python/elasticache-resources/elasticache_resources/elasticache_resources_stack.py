from aws_cdk import Stack
import aws_cdk as cdk
import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_elasticache as elasticache
from constructs import Construct

class ElasticacheResourcesStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)


        # VPC resources to be used

        vpc = ec2.Vpc(self, "TheVPC",
            ip_addresses=ec2.IpAddresses.cidr("10.0.0.0/16")
        )


        # Security Group for EC2 instances
        security_group_name = 'myec2securitygroup'
        ec2SecurityGroup = ec2.SecurityGroup(self, 'EC2SecurityGroup',
            vpc=vpc,
            description='Security group for EC2 instances',
            allow_all_outbound=True,
            security_group_name=security_group_name
        )
        
        # Allowing all inbound traffic (adjust as necessary)
        ec2SecurityGroup.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(0), "Allow all inbound traffic")

        # Elasticache Parameter group
        elastiCacheParameterGroup = elasticache.CfnParameterGroup(self, 'ElastiCacheParameterGroup',
              cache_parameter_group_family = 'redis7',
              description = 'Parameter group for ElastiCache',
              properties = {
                'maxmemory-policy': 'allkeys-lru',
              },
            )

        # Elasticache Security group
        elastiCacheSecurityGroup = elasticache.CfnSecurityGroup(self, 'ElastiCacheSecurityGroup',
              description = 'Security group for ElastiCache',
              tags = [
                {
                  'key': 'Name',
                  'value': 'ElastiCacheSecurityGroup',
                },
              ],
            )

        # Elasticache Serverless Cache
        elastiCacheServerlessCache = elasticache.CfnServerlessCache(self, 'ElastiCacheServerlessCache',
              engine = 'redis',
              serverless_cache_name = "MyServerlessCache",
            )

        # Elasticache Subnet group
        elastiCacheSubnetGroup = elasticache.CfnSubnetGroup(self, 'ElastiCacheSubnetGroup',
              cache_subnet_group_name = "CustomCacheSubnetGroup",
              description = 'Subnet group with required subnets',
              subnet_ids= [vpc.public_subnets[0].subnet_id, vpc.public_subnets[1].subnet_id],
            )

        # Elasticache User
        elastiCacheUser = elasticache.CfnUser(self, 'ElastiCacheUser',
              user_name = 'default',
              user_id = 'u1',
              engine = 'redis',
              access_string = 'on ~* +@all',
              no_password_required = True,
            )

        # Elasticache Replication Group
        elastiCacheReplicationGroup = elasticache.CfnReplicationGroup(self, 'ElastiCacheReplicationGroup',
              replication_group_description = 'Replication group for ElastiCache',
              replication_group_id = "MyReplicationGroup",
              cache_node_type = 'cache.m5.large',
              engine = 'redis',
              num_cache_clusters = 2,
              cache_parameter_group_name = elastiCacheParameterGroup.ref,
            )

        # Elasticache User Group
        elastiCacheUserGroup = elasticache.CfnUserGroup(self, 'ElastiCacheUserGroup',
              user_ids = [
                elastiCacheUser.ref,
              ],
              engine = 'redis',
              user_group_id = 'a1',
            )

        # Elasticache Cluster
        elasticacheCluster = elasticache.CfnCacheCluster(self, 'ElasticacheCluster',
              engine = 'redis',
              cache_node_type = 'cache.m5.large',
              num_cache_nodes = 1,
              cache_subnet_group_name = elastiCacheSubnetGroup.ref,
              vpc_security_group_ids = [
                ec2SecurityGroup.security_group_id,
              ],
            )

        # Elasticache Global Replication Group
        elastiCacheGlobalReplicationGroup = elasticache.CfnGlobalReplicationGroup(self, 'ElastiCacheGlobalReplicationGroup',
              global_replication_group_description = 'Global replication group for ElastiCaches',
              global_replication_group_id_suffix = "global",
              members = [
                {
                  'replicationGroupId': elastiCacheReplicationGroup.ref,
                  'replicationGroupRegion': 'us-east-1',
                  'role': 'PRIMARY',
                },
              ],
            )

        # Outputs
        """
          Security Group ID for ElastiCache
        """
        self.security_group_id = elastiCacheSecurityGroup.ref
        cdk.CfnOutput(self, 'CfnOutputSecurityGroupId', 
          key = 'SecurityGroupId',
          description = 'Security Group ID for ElastiCache',
          value = str(self.security_group_id),
        )

        """
          Replication Group ID for ElastiCache
        """
        self.replication_group_id = elastiCacheReplicationGroup.ref
        cdk.CfnOutput(self, 'CfnOutputReplicationGroupId', 
          key = 'ReplicationGroupId',
          description = 'Replication Group ID for ElastiCache',
          value = str(self.replication_group_id),
        )

        """
          Global Replication Group ID for ElastiCache
        """
        self.global_replication_group_id = elastiCacheGlobalReplicationGroup.ref
        cdk.CfnOutput(self, 'CfnOutputGlobalReplicationGroupId', 
          key = 'GlobalReplicationGroupId',
          description = 'Global Replication Group ID for ElastiCache',
          value = str(self.global_replication_group_id),
        )

        """
          User Group ID for ElastiCache
        """
        self.user_group_id = elastiCacheUserGroup.ref
        cdk.CfnOutput(self, 'CfnOutputUserGroupId', 
          key = 'UserGroupId',
          description = 'User Group ID for ElastiCache',
          value = str(self.user_group_id),
        )



