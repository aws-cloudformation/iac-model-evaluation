package main

import (
	awscdk "github.com/aws/aws-cdk-go/awscdk/v2"
	awsec2 "github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	awsiam "github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	constructs "github.com/aws/constructs-go/constructs/v10"
	jsii "github.com/aws/jsii-runtime-go"
)

type Ec2StackProps struct {
	awscdk.StackProps
}

func NewEc2Stack(scope constructs.Construct, id string, props *Ec2StackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	vpc := awsec2.NewVpc(stack, jsii.String("Vpc"), nil)

	sg := awsec2.NewSecurityGroup(stack, jsii.String("SecurityGroup"), &awsec2.SecurityGroupProps{
		Vpc:              vpc,
		AllowAllOutbound: jsii.Bool(true),
		Description:      jsii.String("Instance Security Group"),
	})

	sg.AddIngressRule(awsec2.Peer_AnyIpv4(), awsec2.NewPort(&awsec2.PortProps{
		Protocol:             awsec2.Protocol_TCP,
		FromPort:             jsii.Number(22),
		ToPort:               jsii.Number(22),
		StringRepresentation: jsii.String("SSH"),
	}),
		jsii.String("Allow SSH (TCP port 22) in"),
		jsii.Bool(false),
	)

	sg.AddIngressRule(awsec2.Peer_AnyIpv4(), awsec2.NewPort(&awsec2.PortProps{
		Protocol:             awsec2.Protocol_TCP,
		FromPort:             jsii.Number(80),
		ToPort:               jsii.Number(80),
		StringRepresentation: jsii.String("HTTP"),
	}),
		jsii.String("Allow HTTP (TCP port 80) in"),
		jsii.Bool(false),
	)

	role := awsiam.NewRole(stack, jsii.String("Role"), &awsiam.RoleProps{
		AssumedBy:   awsiam.NewServicePrincipal(jsii.String("ec2.amazonaws.com"), nil),
		Description: jsii.String("Instance Role"),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonSSMManagedInstanceCore")),
			awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("CloudWatchAgentServerPolicy")),
		},
	})

	role.AddManagedPolicy(awsiam.ManagedPolicy_FromAwsManagedPolicyName(jsii.String("AmazonSSMManagedInstanceCore")))

	instance := awsec2.NewInstance(stack, jsii.String("Ec2Instance"), &awsec2.InstanceProps{
		Vpc:          vpc,
		InstanceType: awsec2.NewInstanceType(jsii.String("t2.micro")),
		MachineImage: awsec2.NewAmazonLinuxImage(&awsec2.AmazonLinuxImageProps{
			Generation: awsec2.AmazonLinuxGeneration(awsec2.AmazonLinuxGeneration_AMAZON_LINUX_2),
		}),
		SecurityGroup: sg,
		Role:          role,
	})

	instance.AddUserData(jsii.String("yum update -y"), jsii.String("yum install -y httpd"), jsii.String("systemctl start httpd"), jsii.String("systemctl enable httpd"),
		jsii.String("echo \"<html><body><h1>Hello World from $(hostname -f)</h1></body></html>\" > /var/www/html/index.html"))

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewEc2Stack(app, "Ec2Stack", &Ec2StackProps{
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
