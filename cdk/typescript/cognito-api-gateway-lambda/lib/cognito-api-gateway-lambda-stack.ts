import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";

export class CognitoApiGatewayLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a new cognito user pool
    const userPool = new UserPool(this, "UserPool");

    // create a new user pool client
    const userPoolClient = userPool.addClient("UserPoolClient");

    // create an HTTP user pool authorizer using my user pool and user pool client
    const auth = new HttpUserPoolAuthorizer("Authorizer", userPool, {
      userPoolClients: [userPoolClient],
    });

    // create a new HTTP API for API Gateway that allows credentials and CORS
    const httpApi = new HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        exposeHeaders: ["www-authenticate"],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
      },
    });

    // create a new Lambda function for Node 18 from my handler code in the lambda directory
    const lambdaFunction = new Function(this, "Lambda", {
      code: Code.fromAsset("lambda"),
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
    });

    // create an HTTP Lambda integration for my Lambda function
    const lambdaIntegration = new HttpLambdaIntegration(
      "LambdaIntegration",
      lambdaFunction
    );

    // create a new route for my HTTP API for the root path that uses my Lambda Integration and my authorizer with GET and OPTIONS methods
    httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.OPTIONS, HttpMethod.GET],
      integration: lambdaIntegration,
      authorizer: auth,
    });
  }
}
