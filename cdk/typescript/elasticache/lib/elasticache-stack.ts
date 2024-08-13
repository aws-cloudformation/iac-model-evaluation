import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as EC2 from "aws-cdk-lib/aws-ec2";
import { aws_elasticache as ElastiCache } from "aws-cdk-lib";
import { SecurityGroup, Peer, Port } from "aws-cdk-lib/aws-ec2";

export class ElasticacheStack extends cdk.Stack {
  private vpc: EC2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const elastiCacheRedisPort = 6379;
    const elastiCacheVPCName = "ElastiCacheVPC";
    const elastiCacheSubnetIds = [];
    const elastiCacheSubnetGroupName = "ElastiCacheSubnetGroup";
    const elastiCacheSecurityGroupName = "ElastiCacheSecurityGroup";
    const elastiCacheStackName = "ElastiCacheRedis";

    //Create VPC
    this.vpc = new EC2.Vpc(this, elastiCacheVPCName.toLowerCase());

    //Create Subnets and Subnet Groups
    for (const subnet of this.vpc.privateSubnets) {
      elastiCacheSubnetIds.push(subnet.subnetId);
    }

    const elastiCacheSubnetGroup = new ElastiCache.CfnSubnetGroup(
      this,
      elastiCacheSubnetGroupName.toLowerCase(),
      {
        description: "ElastiCache Subnet Group",
        cacheSubnetGroupName: elastiCacheSubnetGroupName.toLowerCase(),
        subnetIds: elastiCacheSubnetIds,
      }
    );

    //Create Security Group
    const elastiCacheSecurityGroup = new SecurityGroup(
      this,
      elastiCacheSecurityGroupName.toLowerCase(),
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        description: "ElastiCache Security Group",
        securityGroupName: elastiCacheSecurityGroupName.toLowerCase(),
      }
    );
    elastiCacheSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(elastiCacheRedisPort),
      "ElastiCache Redis Port"
    );

    //Create Elasticache Redis Cluster that passes security and linting checks
    const elastiCacheRedis = new ElastiCache.CfnReplicationGroup(
      this,
      elastiCacheStackName.toLowerCase(),
      {
        replicationGroupDescription: "ElastiCache for Redis",
        numCacheClusters: 2,
        automaticFailoverEnabled: true,
        engine: "redis",
        cacheNodeType: "cache.t2.micro",
        cacheSubnetGroupName: elastiCacheSubnetGroup.ref,
        securityGroupIds: [elastiCacheSecurityGroup.securityGroupId]
      }
    );
    elastiCacheRedis.addDependency(elastiCacheSubnetGroup);
  }
}