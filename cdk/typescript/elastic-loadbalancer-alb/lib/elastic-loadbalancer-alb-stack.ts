import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ElasticLoadbalancerAlbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a vpc
    const vpc = new Vpc(this, 'vpc');

    // Create an Application Load Balancer 
    const alb = new ApplicationLoadBalancer(this, 'alb', {
      vpc: vpc,
      internetFacing: true,
    });

    //Redirect HTTP to HTTPS
    alb.addRedirect();
  }
}
