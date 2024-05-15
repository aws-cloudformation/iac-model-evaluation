import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';

export class DynamodbTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a dynamodb table with a partition key called pk
    // and a sort key called sk
    const table = new ddb.Table(this, 'table', {
        partitionKey: {
            name: 'pk', 
            type: ddb.AttributeType.STRING
        }, 
        sortKey: {
            name: 'sk', 
            type: ddb.AttributeType.STRING
        }
    });

  }
}
