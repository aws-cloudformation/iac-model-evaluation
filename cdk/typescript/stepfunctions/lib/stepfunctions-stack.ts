import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class StepfunctionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a lambda function that returns the status
    const helloFunction = new lambda.Function(this, 'MyLambdaFunction', {
      code: lambda.Code.fromInline(`
          exports.handler = (event, context, callback) => {
              callback(null, event.status);
          };
      `),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      timeout: cdk.Duration.seconds(3)
    });

    // Create a task that triggers the lambda function and returns its output
    const startState = new tasks.LambdaInvoke(this, 'StartState', {
      lambdaFunction: helloFunction,
      payloadResponseOnly: true,
      resultPath: '$.output'
    });

    // Define the states for the state machine
    const successState = new sfn.Pass(this, 'SuccessState');
    const failureState = new sfn.Pass(this, 'FailureState');

    // Define a choice that makes a decision based on the output being "APPROVED" or "REJECTED"
    const choice = new sfn.Choice(this, 'Do you approve this request?');
    const condition1 = sfn.Condition.stringEquals('$.output', 'APPROVED');
    const condition2 = sfn.Condition.stringEquals('$.output', 'REJECTED');

    // Define the definition of the statemachine
    const definition = startState
      .next(choice
        .when(condition1, successState)
        .when(condition2, failureState)
        .otherwise(failureState)
      )
    
    // Create the statemachine
    const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
    
  }
}
