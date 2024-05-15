import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";

export class SnsTopicStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // An SNS topic
        const topic = new sns.Topic(this, "Topic", {
            displayName: "My topic",
        });

        // Add metadata to suppress the cfn-guard warning
        const cfnTopic = topic.node.defaultChild as sns.CfnTopic;
        cfnTopic.cfnOptions.metadata = {
            guard: {
                SuppressedRules: [ 
                    "SNS_ENCRYPTED_KMS"
                ]
            },
            checkov: {
                skip: [
                    { "id": "CKV_AWS_26" }
                ]
            }
        };

    }
}
