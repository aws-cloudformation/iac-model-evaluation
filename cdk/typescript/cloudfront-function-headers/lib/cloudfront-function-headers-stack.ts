import * as cdk from "aws-cdk-lib";
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class CloudfrontFunctionHeadersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create cloudfront function handler code to inject security headers
    const code = `function handler(event) {
        var response = event.response;
        var headers = response.headers;
    
        headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload'}; 
        headers['content-security-policy'] = { value: "default-src 'self'; img-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'"}; 
        headers['x-content-type-options'] = { value: 'nosniff'}; 
        headers['x-frame-options'] = {value: 'DENY'}; 
        headers['x-xss-protection'] = {value: '1; mode=block'}; 
        headers['cache-control'] = {value: 'no-cache, no-store'}; 
    
        return response;
    }`;

    // create a cloudfront function from my function code
    const securityHeaderFunction = new Function(this, "SecurityHeaders", {
      code: FunctionCode.fromInline(code),
    });

    // create a deployment bucket for a static s3 website as a cloudfront origin
    const deploymentBucket = new Bucket(this, "DeploymentBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const oai = new OriginAccessIdentity(this, "OriginAccessIdentity");

    deploymentBucket.grantRead(oai);

    // create a cloudfront distribution with the deployment bucket as origin and securityHeaderFunction as a viewer response
    const cloudfront = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, { originAccessIdentity: oai }),
        functionAssociations: [
          {
            eventType: FunctionEventType.VIEWER_RESPONSE,
            function: securityHeaderFunction,
          },
        ],
      },
    });

    // create a s3 bucket deployment to deploy from my website directory to my deployment bucket
    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("website")],
      destinationBucket: deploymentBucket,
      distribution: cloudfront,
    });
  }
}
