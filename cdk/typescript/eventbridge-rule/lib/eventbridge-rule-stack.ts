import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';
import { Construct } from 'constructs';

// Define a stack that defines an Eventbridge rule and lambda target
export class EventbridgeRuleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an Event bus
    const bus = new events.EventBus(this, 'ControlTowerEventBus', {
      eventBusName: 'ControlTowerEventBus'
    })

    // Create an eventbridge rule that triggers on Control Tower "CreateManagedAccount" and "UpdateManageAccount" events
    const controlTowerRule = new events.Rule(this, 'rule', {
      eventBus: bus,
      eventPattern: {
        source: ["aws.controltower"],
        detailType: ["AWS Service Event via CloudTrail"],
        detail: {
          eventName: ["CreateManagedAccount", "UpdateManagedAccount"]
        }
      },
    });

    // Create a lambda function to be invoked by the rule
    const ruleTargetLambda = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda'))
    })

    // Add the lambda function as the rule target configure with an sns dead letter queue
    controlTowerRule.addTarget(new targets.LambdaFunction(ruleTargetLambda, {
      deadLetterQueue: new sqs.Queue(this, 'DeadLetterQueue'),
      maxEventAge: cdk.Duration.hours(2),
      retryAttempts: 2
    }))
  }
}
