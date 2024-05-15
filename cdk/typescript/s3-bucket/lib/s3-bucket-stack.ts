import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

// Properties for the S3BucketStack
export interface S3BucketStackProps extends cdk.StackProps {
  loggingBucketName: string;
}

// Define the stack to manage an S3 bucket
export class S3BucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S3BucketStackProps) {
    super(scope, id, props);

    // Load an existing S3 bucket to use for logging
    const loggingBucket = s3.Bucket.fromBucketName(
      this,
      "LoggingBucket",
      props.loggingBucketName
    );

    // An S3 bucket with versioning enabled, object lock enabled, public access blocked, and kms encryption enabled
    const bucket = new s3.Bucket(this, "Bucket", {
      versioned: true,
      objectLockEnabled: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      serverAccessLogsBucket: loggingBucket,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: "abortIncompleteUploads",
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
    });

    // SSL is enforce but the guard rule is looking for `"true"` and the synthesized template has `true`
    const cfnBucketPolicy = bucket.policy?.node
      .defaultChild as s3.CfnBucketPolicy;
    cfnBucketPolicy.cfnOptions.metadata = {
      guard: {
        SuppressedRules: ["S3_BUCKET_SSL_REQUESTS_ONLY"],
      },
    };

    // Suppress replication requirement
    const cfnBucket = bucket.node.defaultChild as s3.CfnBucket;
    cfnBucket.cfnOptions.metadata = {
      guard: {
        SuppressedRules: ["S3_BUCKET_REPLICATION_ENABLED"],
      },
    };
  }
}
