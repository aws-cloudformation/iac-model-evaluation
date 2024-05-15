package main

import (
	awscdk "github.com/aws/aws-cdk-go/awscdk/v2"
	awsec2 "github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	awsrds "github.com/aws/aws-cdk-go/awscdk/v2/awsrds"
	sctmgr "github.com/aws/aws-cdk-go/awscdk/v2/awssecretsmanager"
	constructs "github.com/aws/constructs-go/constructs/v10"
	jsii "github.com/aws/jsii-runtime-go"
)

type RdsStackProps struct {
	awscdk.StackProps
}

func NewRdsStack(scope constructs.Construct, id string, props *RdsStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// Creates new VPC
	vpc := awsec2.NewVpc(stack, jsii.String("Vpc"), nil)

	// Creates secret for RDS Database Credentials
	secret := sctmgr.NewSecret(stack, jsii.String("RdsSecret"), &sctmgr.SecretProps{
		GenerateSecretString: &sctmgr.SecretStringGenerator{
			GenerateStringKey:    jsii.String("password"),
			PasswordLength:       jsii.Number(20),
			ExcludeCharacters:    jsii.String(" %+~`#$&*()|[]{}:;<>?!'/@\"\\"),
			SecretStringTemplate: jsii.String("{\"username\":\"admin\"}"),
		},
	})

	// Creates RDS instance using MySQl
	dbPrimInstance := awsrds.NewDatabaseInstance(stack, jsii.String("Rds"), &awsrds.DatabaseInstanceProps{
		Engine: awsrds.DatabaseInstanceEngine_Mysql(&awsrds.MySqlInstanceEngineProps{
			Version: awsrds.MysqlEngineVersion_VER_8_0_33(),
		}),
		Vpc:                vpc,
		Credentials:        awsrds.Credentials_FromSecret(secret, jsii.String("password")),
		RemovalPolicy:      awscdk.RemovalPolicy_DESTROY,
		DeletionProtection: jsii.Bool(false),
	})

	// Creates Outputs for RDS Endpoint and Secret Arn
	awscdk.NewCfnOutput(stack, jsii.String("RdsEndpoint"), &awscdk.CfnOutputProps{
		Value:       dbPrimInstance.InstanceEndpoint().Hostname(),
		Description: jsii.String("RDS Endpoint"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("RdsSecretArn"), &awscdk.CfnOutputProps{
		Value:       secret.SecretArn(),
		Description: jsii.String("RDS Secret Arn"),
	})

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewRdsStack(app, "RdsStack", &RdsStackProps{
		awscdk.StackProps{
			Env: env(),
		},
	})

	app.Synth(nil)
}

// env determines the AWS environment (account+region) in which our stack is to
// be deployed. For more information see: https://docs.aws.amazon.com/cdk/latest/guide/environments.html
func env() *awscdk.Environment {
	// If unspecified, this stack will be "environment-agnostic".
	// Account/Region-dependent features and context lookups will not work, but a
	// single synthesized template can be deployed anywhere.
	//---------------------------------------------------------------------------
	return nil

	// Uncomment if you know exactly what account and region you want to deploy
	// the stack to. This is the recommendation for production stacks.
	//---------------------------------------------------------------------------
	// return &awscdk.Environment{
	//  Account: jsii.String("123456789012"),
	//  Region:  jsii.String("us-east-1"),
	// }

	// Uncomment to specialize this stack for the AWS Account and Region that are
	// implied by the current CLI configuration. This is recommended for dev
	// stacks.
	//---------------------------------------------------------------------------
	// return &awscdk.Environment{
	//  Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
	//  Region:  jsii.String(os.Getenv("CDK_DEFAULT_REGION")),
	// }
}
