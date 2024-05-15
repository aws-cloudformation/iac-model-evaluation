import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Key } from 'aws-cdk-lib/aws-kms';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a log group for API Gateway access logs for my-app
    // Create a log group encryption key with rotation
    const apigwLogs = new LogGroup(this, 'ApiGatewayAccessLogGroup',{
      logGroupName: '/aws/apigateway/my-app',
      encryptionKey: new Key(this, "APIGWLogEncryptionKey", {
        enableKeyRotation: true,
      }),
    });

    // Create API Gateway that passes security and linting checks
    // Send logs to apigwLogs
    // Enable caching with encryption
    // Enable tracing
    const apigw = new apigateway.RestApi(this, 'ApiGateway', {
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(apigwLogs),
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        cachingEnabled: true,
        cacheDataEncrypted: true,
        tracingEnabled: true,
      }
    });

    // Add a resource to the API Gateway called my-app
    const myApp = apigw.root.addResource('my-app');
    // Add a GET method to myApp that requires an API key
    myApp.addMethod('GET', undefined, { apiKeyRequired: true });
    // Add a POST method to myApp that requires an API key
    myApp.addMethod('POST', undefined, { apiKeyRequired: true });

  }
}
