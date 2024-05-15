package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsec2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsecs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsefs"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awskms"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type EfsStackProps struct {
	awscdk.StackProps
}

func NewEfsStack(scope constructs.Construct, id string, props *EfsStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// Create a KMS Key for EFS encryption
	kmsKey := awskms.NewKey(stack, jsii.String("EfsKmsKey"), &awskms.KeyProps{
		EnableKeyRotation: jsii.Bool(true),
	})

	// Create a VPC with a CIDR 10.0.0.0/16
	vpc := awsec2.NewVpc(stack, jsii.String("MyVpc"), &awsec2.VpcProps{
		IpAddresses:        awsec2.IpAddresses_Cidr(jsii.String("10.0.0.0/16")),
		MaxAzs:             jsii.Number(3),
		EnableDnsHostnames: jsii.Bool(true),
		EnableDnsSupport:   jsii.Bool(true),
	})

	// Define EFS security group
	efsSecurityGroup := awsec2.NewSecurityGroup(stack, jsii.String("EfsSecurityGroup"), &awsec2.SecurityGroupProps{
		Vpc:              vpc,
		AllowAllOutbound: jsii.Bool(true),
	})

	// Add inbound rule on port 2049 to allow NFS traffic
	efsSecurityGroup.AddIngressRule(awsec2.Peer_AnyIpv4(), awsec2.Port_Tcp(jsii.Number(2049)), jsii.String("Allow NFS inbound traffic"), jsii.Bool(true))

	// Create an EFS resource arn and dynamically pass the region and account id
	efsResourceArn := awscdk.Fn_Sub(jsii.String("arn:aws:elasticfilesystem:${AWS::Region}:${AWS::AccountId}:file-system/*"), nil)

	// Create a policy statement
	statement := awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Actions: &[]*string{
			jsii.String("elasticfilesystem:ClientWrite"),
			jsii.String("elasticfilesystem:ClientMount"),
			jsii.String("elasticfilesystem:ClientRootAccess"),
		},
		Effect: awsiam.Effect_ALLOW,
		Principals: &[]awsiam.IPrincipal{
			awsiam.NewAnyPrincipal(),
		},
		Resources: &[]*string{
			efsResourceArn,
		},
	})

	// Add the statement to a policy document
	FileSystemPolicy := awsiam.NewPolicyDocument(&awsiam.PolicyDocumentProps{
		Statements: &[]awsiam.PolicyStatement{statement},
	})

	// Create an EFS Filesystem
	efsFileSystem := awsefs.NewFileSystem(stack, jsii.String("MyEfsFileSystem"), &awsefs.FileSystemProps{
		Vpc:              vpc,
		Encrypted:        jsii.Bool(true),
		KmsKey:           kmsKey,
		SecurityGroup:    efsSecurityGroup,
		FileSystemPolicy: FileSystemPolicy,
	})

	// Create an ECS Cluster
	ecsCluster := awsecs.NewCluster(stack, jsii.String("MyCluster"), &awsecs.ClusterProps{
		Vpc: vpc,
	})

	// Create ECS Task Definition
	taskDefinition := awsecs.NewFargateTaskDefinition(stack, jsii.String("MyFargateTask"), &awsecs.FargateTaskDefinitionProps{
		MemoryLimitMiB: jsii.Number(512),
		Cpu:            jsii.Number(256),
	})

	// Define the EFS volume in the task definition
	taskDefinition.AddVolume(&awsecs.Volume{
		Name: jsii.String("MyEfsVolume"),
		EfsVolumeConfiguration: &awsecs.EfsVolumeConfiguration{
			FileSystemId:  efsFileSystem.FileSystemId(),
			RootDirectory: jsii.String("/"),
		},
	})

	// Get task definition role
	taskRole := taskDefinition.TaskRole()

	// Add elasticfilesystem:ClientMount and elasticfilesystem:ClientWrite permission to the role
	taskRole.AddToPrincipalPolicy(awsiam.NewPolicyStatement(&awsiam.PolicyStatementProps{
		Actions:   jsii.Strings("elasticfilesystem:ClientMount", "elasticfilesystem:ClientWrite"),
		Resources: jsii.Strings("*"),
	}))

	// Add a container to the task definition
	container := taskDefinition.AddContainer(jsii.String("MyContainer"), &awsecs.ContainerDefinitionOptions{
		Image: awsecs.ContainerImage_FromRegistry(jsii.String("amazon/amazon-ecs-sample"), nil),
	})

	// Mount the EFS volume to the container
	container.AddMountPoints(&awsecs.MountPoint{
		SourceVolume:  jsii.String("MyEfsVolume"),
		ContainerPath: jsii.String("/mnt/efs"),
		ReadOnly:      jsii.Bool(false),
	})

	// Create Fargate Service
	awsecs.NewFargateService(stack, jsii.String("MyFargateService"), &awsecs.FargateServiceProps{
		Cluster:        ecsCluster,
		TaskDefinition: taskDefinition,
	})

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewEfsStack(app, "EfsStack", &EfsStackProps{
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
