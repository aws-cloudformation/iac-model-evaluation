import * as cdk from 'aws-cdk-lib';
import { CfnMicrosoftAD } from 'aws-cdk-lib/aws-directoryservice';
import { Instance, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Ec2DomainJoinMadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new Vpc(this, 'vpc');

    // Create a secret with a random password
    const secret = new Secret(this, 'secret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
      }
    });

    // Create Managed AD with domian name example.com
    new CfnMicrosoftAD(this, 'mad', {
      name: 'example.com',
      password: secret.secretValueFromJson('password').unsafeUnwrap(),
      vpcSettings: {
        vpcId: vpc.vpcId,
        subnetIds: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_EGRESS
        }).subnetIds
      }
    });

  }
}
