import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as imagebuilder from 'aws-cdk-lib/aws-imagebuilder';
import * as iam from 'aws-cdk-lib/aws-iam';
import fs = require('fs');
import * as path from 'path'
import { Construct } from 'constructs';

export class ImageBuilderStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Creating a custom component by using a sample document definition present inside the bin/imagebuilder-components directory
    const cfnComponent = new imagebuilder.CfnComponent(this, 'MyCfnComponent', {
      name: 'sample-component',
      platform: 'Linux',
      version: '1.0.0',
      data: fs.readFileSync(
        path.resolve('bin/imagebuilder-components/component-data.yaml'),
        'utf8'
      )
    });

    // Creating Image Recipe where we are using the custom component created above and an AWS-managed component 
    const cfnImageRecipe = new imagebuilder.CfnImageRecipe(this, 'MyCfnImageRecipe', {
      components: [{
        componentArn: `arn:aws:imagebuilder:${this.region}:${this.account}:component/${cfnComponent.attrName}/x.x.x`
      },{
        componentArn: `arn:aws:imagebuilder:${this.region}:aws:component/chrony-time-configuration-test/x.x.x`
      }],
      name: 'sample-recipe',
      parentImage: `arn:aws:imagebuilder:${this.region}:aws:image/amazon-linux-2-ecs-optimized-x86/x.x.x`,
      version: '1.0.0',
      blockDeviceMappings: [{
        deviceName: '/dev/xvda',
        ebs: {
          deleteOnTermination: true,
          encrypted: false,
          volumeSize: 30,
          volumeType: 'gp2',
        }
      }],
      workingDirectory: '/tmp',
    });
    
    // Creating IAM Instance Profile to be used by the Infrastructure configuration

    const iamRoleImageBuilder = new iam.Role(this, 'IAMRoleImageBuilder',{
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess"
        }
      ]
    })

    const iamInstanceProfileRoleImageBuilder = new iam.InstanceProfile(this, 'IAMInstanceProfileRoleImageBuilder',{
      role: iamRoleImageBuilder
    })


    // Creating Infrastructure Configuration
    const cfnInfrastructureConfiguration = new imagebuilder.CfnInfrastructureConfiguration(this, 'MyCfnInfrastructureConfiguration', {
      instanceProfileName: iamInstanceProfileRoleImageBuilder.instanceProfileName ,
      name: 'sample-infra-configuration',
      terminateInstanceOnFailure: true,
    }); 

    // Creating Distribution Configuration to distribute the AMI to us-west-2 region of same account.
    const cfnDistributionConfiguration = new imagebuilder.CfnDistributionConfiguration(this, 'MyCfnDistributionConfiguration', {
      distributions: [{
        region: 'us-west-2',
        amiDistributionConfiguration: {
          LaunchPermissionConfiguration:  {
            userIds: [`${this.account}`]
          }
        }
        }],
      name: 'sample-distribution-configuration',
    });

    // Creating ImageBuilder Pipeline
    const cfnImagePipeline = new imagebuilder.CfnImagePipeline(this, 'MyCfnImagePipeline', {
      name: 'sample-image-pipeline',
      infrastructureConfigurationArn: cfnInfrastructureConfiguration.attrArn,
      distributionConfigurationArn: cfnDistributionConfiguration.attrArn,
      enhancedImageMetadataEnabled: false,
      imageRecipeArn: cfnImageRecipe.attrArn,
      imageScanningConfiguration: {
        imageScanningEnabled: true,
      },
      imageTestsConfiguration: {
        imageTestsEnabled: true
      },
      schedule: {
        pipelineExecutionStartCondition: 'EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE',
        scheduleExpression: 'cron(0 9 * * ?)',
      },
      status: 'ENABLED'
    });


    // Creating IAM role to be used by the ImageBuilder LifecyclePolicy
    const iamRoleForLifeCyclePolicy = new iam.Role(this, 'MyIamRoleForLifeCyclePolicy',{
      assumedBy: new iam.ServicePrincipal('imagebuilder.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess"
        }
      ]
    })

    
    // Creating ImageBuilder LifecyclePolicy
    const cfnLifecyclePolicy = new imagebuilder.CfnLifecyclePolicy(this, 'MyCfnLifecyclePolicy', {
      executionRole: iamRoleForLifeCyclePolicy.roleArn,
      name: 'sample-lifecycle-policy',
      status: 'ENABLED',
      resourceType: 'AMI_IMAGE',
      resourceSelection: {
        tagMap: {
          Environment: 'Dev',
        },
      },
      policyDetails: [{
        action: {
          type: 'DEPRECATE',
          includeResources: {
            amis: true
          },
        },
        filter: {
          type: 'AGE',
          value: 6,
          unit: 'MONTHS',
        }
      }]
    })

    // Creating ImageBuilder Workflow using a sample document definition present inside the bin/imagebuilder-components directory
    const cfnWorkflow = new imagebuilder.CfnWorkflow(this, 'MyCfnWorkflow',{
      name: 'sample-workflow',
      type: 'BUILD',
      version: '1.0.0',
      data: fs.readFileSync(
        path.resolve('bin/imagebuilder-components/workflow-data.yaml'),
        'utf8'
      )
    })

  }
}
