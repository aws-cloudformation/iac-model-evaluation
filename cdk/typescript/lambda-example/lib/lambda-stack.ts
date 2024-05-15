import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';

class LambdaExampleStack extends cdk.Stack {
    constructor(scope: Construct, constructId: string, props?: cdk.StackProps) {
        super(scope, constructId, props);

        const myLambda = new lambda.Function(this, 'MyLambdaFunction', {
            handler: 'index.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
            runtime: lambda.Runtime.PYTHON_3_11,
        });
    }
}