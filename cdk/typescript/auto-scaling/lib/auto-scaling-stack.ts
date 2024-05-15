import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { readFileSync } from 'fs';

export class AutoScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an Auto scaling group that created EC2 Web servers
    // The Web server will be running Apache HTTP Server


    // Define a VPC (Using a default VPC )
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
    });

    // Add Instance IAM Role
    const instanceRole = new iam.Role(this, 'instanceRole', {
      roleName: 'EC2InstanceRole',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    // Add SSM Permissions so that SSM can manage the EC2 Instances
    instanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2RoleforSSM'))
     

    // Add Security Group
    const webServerSg = new ec2.SecurityGroup(this, 'webServerSg',{
      vpc: vpc,
      securityGroupName: 'WebServerSecurityGroup',
      allowAllOutbound: true,
      description: "Web Server Security Group"
    });

    // Add Ingress Rule
    webServerSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Web from anywhere')

    // Auto Scaling Configuration
    const webServerAutoscalingGroup = new autoscaling.AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc: vpc,
      autoScalingGroupName: 'WebServerAutoScalingGroup',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(), // Fetch the latest Amazon Linux image
      maxCapacity: 4,
      minCapacity: 1,
      desiredCapacity: 2,
      role: instanceRole
    });

    // Add user Data
     const userdata = readFileSync('./lib/userdata.sh', 'utf8')
     webServerAutoscalingGroup.addUserData(userdata)

    // Add security group to ASG
    webServerAutoscalingGroup.addSecurityGroup(webServerSg)

    //Add Load Balancer
    const webServerAlb = new elbv2.ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      loadBalancerName: 'WebServerLoadBalancer',
      internetFacing: true
    });

    //Add ApplicationLoadBalancer listner 
    const listener = webServerAlb.addListener('Alb_Listener', {
      port: 80,
      open: true
    });

    //Add ApplicationLoadBalancer Target
    listener.addTargets('EC2-WebFleet', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [webServerAutoscalingGroup]
    });
    
    // Output ApplicationLoadBalancerUrl
    new cdk.CfnOutput(this, 'ApplicationLoadBalancerUrl', {value: webServerAlb.loadBalancerDnsName!})
  }
}