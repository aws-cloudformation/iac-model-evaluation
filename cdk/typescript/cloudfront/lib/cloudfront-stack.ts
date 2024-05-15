import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { 
  Bucket
} from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class CloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a HTTPS only CloudFront Distribution with WAF from a S3 bucket origin that passes
    // security and linting checks.
    // Use mywebsitebucket as the bucket name and index.html as the default root object.
    // Use myloggingbucket as the log bucket
    // Use mywebsite.com as the domain name
    // Use mybackupsite.com as the fallback origin
    // Use arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/473e64fd-f30b-4765-81a0-62ad96dd167a for the waf acl id
    // Use arn:aws:acm:us-east-1:123456789012:certificate/11-3336f1-44483d-adc7-9cd375c5169d for the certificate
    new cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: new origins.OriginGroup({
          primaryOrigin: new origins.S3Origin(Bucket.fromBucketName(this, "myCloudFrontS3Bucket", 'mywebsitebucket')),
          fallbackOrigin: new origins.HttpOrigin('mybackupsite.com'),
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      },
      defaultRootObject: 'index.html',
      logBucket: Bucket.fromBucketName(this, "myCloudFrontLogsBucket", 'myloggingbucket'),
      webAclId: "arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/473e64fd-f30b-4765-81a0-62ad96dd167a",
      certificate: acm.Certificate.fromCertificateArn(this, "importedCert", "arn:aws:acm:us-east-1:123456789012:certificate/11-3336f1-44483d-adc7-9cd375c5169d"),
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      domainNames: ["mywebsite.com"]
    });
  }
}
