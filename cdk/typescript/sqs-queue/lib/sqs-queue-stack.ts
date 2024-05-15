import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SqsQueueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SQS queue that passes linting and security checks
    new sqs.Queue(this, 'ExampleSqsQueue', {
        encryption: sqs.QueueEncryption.KMS_MANAGED,
        enforceSSL: true,
    });
  }
}
