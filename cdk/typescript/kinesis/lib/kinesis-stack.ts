import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import { Key } from 'aws-cdk-lib/aws-kms';

export class KinesisStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an encrypted Kinesis Data Stream named "MyKinesisDataStream" that passes security and linting checks
    new kinesis.Stream(this, 'MyStream', {
      streamName: "MyKinesisDataStream",
      encryption: kinesis.StreamEncryption.KMS,
      encryptionKey: new Key(this, "KinesisEncryptionKey", { enableKeyRotation: true }),
    });

  }
}
