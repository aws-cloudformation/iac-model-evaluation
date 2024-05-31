import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {BlockPublicAccess, Bucket, BucketEncryption} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import {Distribution, Function, FunctionCode, FunctionRuntime, OriginAccessIdentity} from "aws-cdk-lib/aws-cloudfront";
import {CanonicalUserPrincipal, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {BehaviorOptions} from "aws-cdk-lib/aws-cloudfront/lib/distribution";

export class DemoCloudfrontFunctionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a bucket to deploy the website files
    const bucket = new Bucket(this, 'WebsiteBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    // create a s3 bucket deployment to deploy the website directory's files to the website bucket
    new BucketDeployment(this, 'WebsiteFiles', {
      destinationBucket: bucket,
      sources: [Source.asset('./website')],
      contentType: 'text/html',
      retainOnDelete: false,
    });

    // create a cloudFront function from the request-function.js file
    const requestFunction = new Function(this, 'RequestFunction', {
      functionName: 'RequestFunction',
      runtime: FunctionRuntime.JS_2_0,
      code: FunctionCode.fromFile({
        filePath: './cloudfront-functions/request-function.js'
      })
    });

    // create a cloudFront function from the response-function.js file
    const responseFunction = new Function(this, 'ResponseFunction', {
      functionName: 'ResponseFunction',
      runtime: FunctionRuntime.JS_2_0,
      code: FunctionCode.fromFile({
        filePath: './cloudfront-functions/response-function.js'
      })
    });

    const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${id}`
    });

    bucket.addToResourcePolicy(new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    // create a CloudFront behavior with origin of my website bucket and both request and response functions
    const defaultBehavior: BehaviorOptions = {
      origin: new cdk.aws_cloudfront_origins.S3Origin(bucket),
      compress: true,
      allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_ALL,
      functionAssociations: [
        {
          function: requestFunction,
          eventType: cdk.aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
        {
          function: responseFunction,
          eventType: cdk.aws_cloudfront.FunctionEventType.VIEWER_RESPONSE,
        }
      ]
    };

    // create a CloudFront distribution with the behavior created
    const distribution = new Distribution(this, 'SiteDistribution', {
      comment: 'CloudFront Functions example',
      defaultRootObject: 'index.html',
      defaultBehavior: defaultBehavior,
    });

    // create an output with the CloudFront distribution URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
    });

  }
}
