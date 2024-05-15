import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";

export class NodejsLambdaExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a nodejs function with entry lambda/index.ts and a handler named customHandler
    new NodejsFunction(this, "CustomHandlerFunction", {
      entry: "lambda/index.ts",
      handler: "customHandler",
      runtime: Runtime.NODEJS_18_X,
    });

    // create a nodejs function using ARM with lambda with entry lambda/index.ts
    new NodejsFunction(this, "ARMFunction", {
      entry: "lambda/index.ts",
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_18_X,
    });
  }
}
