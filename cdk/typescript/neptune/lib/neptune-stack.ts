import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as neptune from '@aws-cdk/aws-neptune-alpha';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

/**
 * A cdk stack that creates a neptune cluster.
 */
export class NeptuneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a neptune cluster parameter group
    const clusterParameterGroup = new neptune.ClusterParameterGroup(this,
            "pgroup", {
                description: "Neptune cluster parameter group",
                parameters: {
                    neptune_enable_audit_log: "1",
                },
            },
        );

    // Create a neptune database parameter group with a timeout of 10 seconds
    const parameterGroup = new neptune.ParameterGroup(this, "DbParams", {
        description: "Neptune db parameter group",
        parameters: {
            neptune_query_timeout: "10000",
        },
    });

    // Create a VPC for the Neptune cluster
    const vpc = new ec2.Vpc(this, 'neptunevpc', {});

    // Create an ec2 security group for the neptune cluster
    const clusterSecurityGroup = new ec2.SecurityGroup(this, "clustersg", {
        vpc,
        description: "Neptune cluster security group",
    })

    // Create a neptune cluster
    const cluster = new neptune.DatabaseCluster(this, "cluster", {
        vpc,
        instanceType: neptune.InstanceType.T3_MEDIUM,
        clusterParameterGroup,
        parameterGroup,
        backupRetention: cdk.Duration.days(10),
        deletionProtection: true,
        securityGroups: [clusterSecurityGroup],
    });

    // Create a stack output for the writer host:port
    new cdk.CfnOutput(this, "Endpoint", {
        value: cluster.clusterEndpoint.socketAddress,
    });
  }
}
