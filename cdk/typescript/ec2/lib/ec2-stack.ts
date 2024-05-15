import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { readFileSync } from 'fs';

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an EC2 Instance in My Account Default VPC

    // Get Default VPC
    const defaultVpc = ec2.Vpc.fromLookup(this, 'defaultVPC', { isDefault: true })

    // Security Group
    const instanceSecurityGroup = new ec2.SecurityGroup(
      this,
      'ec2-instance-sg',
      {
        vpc: defaultVpc,
        allowAllOutbound: true, 
        securityGroupName: 'ec2-instance-sg',
        description: 'Security Group for EC2 Instance'
      }
    )
    
    //Your Public IpAddress here. 
    const myIpaddress: string='1.2.3.4/32'     //Replace this with your publicip address

    // Allow inbound traffic to ports 22, 80 and 443
    instanceSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(myIpaddress),
      ec2.Port.tcp(22), 
      'Allow SSH from self PublicIPAddress',
      )

    instanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcp(80), 'Allow HTTP from anywhere')

    instanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcp(443), 'Allow HTTPS from anywhere')

    // Create EC2 Instance
    const instance = new ec2.Instance(this, 'ec2-instance', {
      vpc: defaultVpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: instanceSecurityGroup,
      instanceName: 'ec2-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      //keyName: 'My-instance-keyName', // Ensure you have created a keypair. Replace with your key name you created
      allowAllOutbound: true,
      associatePublicIpAddress: true,
    })

    // Add userdata
    const userData = readFileSync('./lib/userData.sh', 'utf8')

    instance.addUserData(userData)
    
    //Output publicdns of the ec2 server
    new cdk.CfnOutput(this, 'ec2-instance-dns', {
      value: instance.instancePublicDnsName
    })
  }
}
