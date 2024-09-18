import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';

export class ElasticacheResourcesStack extends cdk.Stack {
  public readonly securityGroupId: string;
  public readonly replicationGroupId: string;
  public readonly globalReplicationGroupId: string;
  public readonly userGroupId: string;

  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC resources to be used
    const vpc = new ec2.Vpc(this, "TheVPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
    });

    // Security Group for EC2 instances
    const securityGroupName = 'myec2securitygroup';
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc,
      description: 'Security group for EC2 instances',
      allowAllOutbound: true,
      securityGroupName,
    });

    // Allowing all inbound traffic (adjust as necessary)
    ec2SecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(0), "Allow all inbound traffic");

    // ElastiCache Parameter Group
    const elastiCacheParameterGroup = new elasticache.CfnParameterGroup(this, 'ElastiCacheParameterGroup', {
      cacheParameterGroupFamily: 'redis7',
      description: 'Parameter group for ElastiCache',
      properties: {
        'maxmemory-policy': 'allkeys-lru',
      },
    });

    // ElastiCache Security Group
    const elastiCacheSecurityGroup = new elasticache.CfnSecurityGroup(this, 'ElastiCacheSecurityGroup', {
      description: 'Security group for ElastiCache',
      tags: [
        {
          key: 'Name',
          value: 'ElastiCacheSecurityGroup',
        },
      ],
    });

    // ElastiCache Serverless Cache
    const elastiCacheServerlessCache = new elasticache.CfnServerlessCache(this, 'ElastiCacheServerlessCache', {
      engine: 'redis',
      serverlessCacheName: "MyServerlessCache",
    });

    // ElastiCache Subnet Group
    const elastiCacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'ElastiCacheSubnetGroup', {
      cacheSubnetGroupName: "CustomCacheSubnetGroup",
      description: 'Subnet group with required subnets',
      subnetIds: [vpc.publicSubnets[0].subnetId, vpc.publicSubnets[1].subnetId],
    });

    // ElastiCache User
    const elastiCacheUser = new elasticache.CfnUser(this, 'ElastiCacheUser', {
      userName: 'default',
      userId: 'u1',
      engine: 'redis',
      accessString: 'on ~* +@all',
      noPasswordRequired: true,
    });

    // ElastiCache Replication Group
    const elastiCacheReplicationGroup = new elasticache.CfnReplicationGroup(this, 'ElastiCacheReplicationGroup', {
      replicationGroupDescription: 'Replication group for ElastiCache',
      replicationGroupId: "MyReplicationGroup",
      cacheNodeType: 'cache.m5.large',
      engine: 'redis',
      numCacheClusters: 2,
      cacheParameterGroupName: elastiCacheParameterGroup.ref,
    });

    // ElastiCache User Group
    const elastiCacheUserGroup = new elasticache.CfnUserGroup(this, 'ElastiCacheUserGroup', {
      userIds: [elastiCacheUser.ref],
      engine: 'redis',
      userGroupId: 'a1',
    });

    // ElastiCache Cluster
    const elasticacheCluster = new elasticache.CfnCacheCluster(this, 'ElasticacheCluster', {
      engine: 'redis',
      cacheNodeType: 'cache.m5.large',
      numCacheNodes: 1,
      cacheSubnetGroupName: elastiCacheSubnetGroup.ref,
      vpcSecurityGroupIds: [ec2SecurityGroup.securityGroupId],
    });

    // ElastiCache Global Replication Group
    const elastiCacheGlobalReplicationGroup = new elasticache.CfnGlobalReplicationGroup(this, 'ElastiCacheGlobalReplicationGroup', {
      globalReplicationGroupDescription: 'Global replication group for ElastiCaches',
      globalReplicationGroupIdSuffix: "global",
      members: [{
        replicationGroupId: elastiCacheReplicationGroup.ref,
        replicationGroupRegion: 'us-east-1',
        role: 'PRIMARY',
      }],
    });

    // Outputs
    this.securityGroupId = elastiCacheSecurityGroup.ref;

    new cdk.CfnOutput(this, 'CfnOutputSecurityGroupId', {
      value: this.securityGroupId,
      description: 'Security Group ID for ElastiCache',
      exportName: "SecurityGroupID",
    });

    this.replicationGroupId = elastiCacheReplicationGroup.ref;

    new cdk.CfnOutput(this, 'CfnOutputReplicationGroupId', {
      value: this.replicationGroupId,
      description: 'Replication Group ID for ElastiCache',
      exportName: "ReplicationGroupID",
    });

    this.globalReplicationGroupId = elastiCacheGlobalReplicationGroup.ref; // Set based on your implementation if needed.

    new cdk.CfnOutput(this, 'CfnOutputGlobalReplicationGroupId', {
      value: this.globalReplicationGroupId,
      description: 'Global Replication Group ID for ElastiCache',
      exportName: "GlobalReplicationGroupID",
    });

    this.userGroupId = elastiCacheUserGroup.ref;

    new cdk.CfnOutput(this, 'CfnOutputUserGroupId', {
       value:this.userGroupId,
       description:'User Group ID for ElastiCache',
       exportName:"UserGroupID",
     });
  }
}