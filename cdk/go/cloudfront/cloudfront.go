package main

import (
	awscdk "github.com/aws/aws-cdk-go/awscdk/v2"
	cloudfront "github.com/aws/aws-cdk-go/awscdk/v2/awscloudfront"
	origins "github.com/aws/aws-cdk-go/awscdk/v2/awscloudfrontorigins"
	s3 "github.com/aws/aws-cdk-go/awscdk/v2/awss3"
	constructs "github.com/aws/constructs-go/constructs/v10"
	jsii "github.com/aws/jsii-runtime-go"
)

type CloudfrontStackProps struct {
	awscdk.StackProps
}

// Creates a stack that will be used as the parent stack for the Cloudfront distribution.
func NewCloudfrontStack(scope constructs.Construct, id string, props *CloudfrontStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	// Creates a stack that will be used as the parent stack for the Cloudfront distribution.
	stack := awscdk.NewStack(scope, &id, &sprops)

	// Creates a S3 bucket that will be used as the origin.
	bucket := s3.NewBucket(stack, jsii.String("mybucket"), &s3.BucketProps{
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
		Versioned:     jsii.Bool(false),
	})

	// Creates a Cloudfront distribution that uses the S3 bucket as its origin.
	// Has logging configured to S3.
	distribution := cloudfront.NewDistribution(stack, jsii.String("mydistribution"), &cloudfront.DistributionProps{
		DefaultBehavior: &cloudfront.BehaviorOptions{
			Origin: origins.NewS3Origin(bucket, &origins.S3OriginProps{
				OriginPath: jsii.String("/mywebsite"),
			}),
		},
		EnableLogging: jsii.Bool(true),
		LogBucket: s3.NewBucket(stack, jsii.String("LogBucket"), &s3.BucketProps{
			ObjectOwnership: s3.ObjectOwnership_OBJECT_WRITER,
		}),
		LogFilePrefix:      jsii.String("distribution-access-logs/"),
		LogIncludesCookies: jsii.Bool(true),
	})

	// Creates an output that will be used to access the Cloudfront distribution domain name.
	awscdk.NewCfnOutput(stack, jsii.String("myoutput"), &awscdk.CfnOutputProps{
		Value:      distribution.DistributionDomainName(),
		ExportName: jsii.String("myoutput"),
	})

	return stack
}

func main() {
	app := awscdk.NewApp(nil)

	NewCloudfrontStack(app, "CloudfrontStack", &CloudfrontStackProps{
		awscdk.StackProps{
			Env: env(),
		},
	})

	app.Synth(nil)
}

func env() *awscdk.Environment {
	return nil
}
