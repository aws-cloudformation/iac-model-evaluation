import { Stack, StackProps } from 'aws-cdk-lib';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions'
import { Construct } from 'constructs';
import { 
  Vpc,
  SubnetType,
  IpAddresses,
  InstanceType,
  InstanceClass,
  InstanceSize,
} from 'aws-cdk-lib/aws-ec2';


export class DocDBStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create private VPC with cidr block 10.0.0.0/16
    const vpc = new Vpc(this, 'docdbvpc',{
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      restrictDefaultSecurityGroup: false,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        }
      ]
    });

    // Create a custom DocDB cluster parameter group that enables TLS and auditing on cluster.
    const parameterGroup = new docdb.ClusterParameterGroup(this, 'CustomClusterParameterGroup',{
      family: 'docdb5.0',
      parameters: {
        audit_logs: "enabled",
        tls: "enabled",
        profiler: "enabled"
      },
      dbClusterParameterGroupName: `${this.stackName}-CustomClusterParameterGroup`,

    })

    // Create a DocDB cluster with 2 DocDB instances
    const cluster = new docdb.DatabaseCluster(this, 'Database', {
      masterUser: {
        username: 'myuser', // NOTE: 'admin' is reserved by DocumentDB
        excludeCharacters: '\"@/:', // optional, defaults to the set "\"@/" and is also used for eventually created rotations
        secretName: '/myapp/mydocdb/masteruser', // optional, if you prefer to specify the secret name
      },
      dbClusterName: `${this.stackName}-DocDBCluster`,
      instances: 2,
      instanceType: InstanceType.of(InstanceClass.MEMORY5, InstanceSize.LARGE),
      parameterGroup,
      vpc,
      exportProfilerLogsToCloudWatch: true,
      exportAuditLogsToCloudWatch: true,
      copyTagsToSnapshot: true 
    });


    // Create a SNS topic and subscribe your Email to it. Replace xyz@domain.com with your Email ID. 
    const snsTopic = new sns.Topic(this, 'Topic');
    const myEmail: string = 'xyz@domain.com';
    snsTopic.addSubscription(new subs.EmailSubscription(myEmail));

    // Create an Amazon DocumentDB event notification subscription.
    new docdb.CfnEventSubscription(this, 'MyCfnEventSubscription', {
      snsTopicArn: snsTopic.topicArn,
      enabled: false,
      sourceIds: [cluster.clusterIdentifier],
      sourceType: 'db-cluster',
      subscriptionName: `${this.stackName}-EventSubscription`,
    });
  }
}
