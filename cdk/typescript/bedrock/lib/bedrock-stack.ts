import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

export class BedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const openSearchCollectionArn = new cdk.CfnParameter(this, 'OpenSearchCollectionARN', {
      type: 'String',
      description: 'OpenSearch Service Serverless (AOSS) collection ARN.'
    });

    const embeddingModelArn = new cdk.CfnParameter(this, 'EmbeddingModelArn', {
      type: 'String',
      description: 'Knowledge Base Model Arn, can use \'aws bedrock list-foundation-models\' to get'
    });

    const aossIndexName = new cdk.CfnParameter(this, 'AOSSIndexName', {
      type: 'String',
      description: 'Name of the vector index in the Amazon OpenSearch Service Serverless (AOSS) collection.'
    });

    const vectorField = new cdk.CfnParameter(this, 'VectorField', {
      type: 'String',
      description: 'Provide a name for the field'
    });

    const textField = new cdk.CfnParameter(this, 'TextField', {
      type: 'String',
      description: 'Provide additional information that a knowledge base can retrieve with vectors'
    });

    const metadataField = new cdk.CfnParameter(this, 'MetadataField', {
      type: 'String',
      description: 'Provide additional metadata that a knowledge base can retrieve with vectors'
    });

    const knowledgeBaseName = new cdk.CfnParameter(this, 'KnowledgeBaseName', {
      type: 'String',
      description: 'The name of the knowledge base.'
    });

    const bedrockExecutionRoleArnForKnowledgeBase = new cdk.CfnParameter(this, 'BedrockExecutionRoleARNForKnowledgeBase', {
      type: 'String',
      description: 'The knowledge base execution role-arn which is being trusted by your Opensearch serverless collection access-policy.'
    });

    const knowledgeBaseDescription = new cdk.CfnParameter(this, 'KnowledgeBaseDescription', {
      type: 'String',
      description: 'The description of the knowledge base.'
    });

    const dataSourceName = new cdk.CfnParameter(this, 'DataSourceName', {
      type: 'String',
      description: 'Name of the Bedrock DataSource'
    });

    const dataSourceBucketName = new cdk.CfnParameter(this, 'DataSourceBucketName', {
      type: 'String',
      description: 'Name of the S3 bucket which stored the DataSource'
    });

    const agentName = new cdk.CfnParameter(this, 'AgentName', {
      type: 'String',
      description: 'Name of the Bedrock Agent'
    });

    const foundationModelForAgent = new cdk.CfnParameter(this, 'FoundationModelForAgent', {
      type: 'String',
      description: 'Foundation Model which will be used by your Bedrock Agent'
    });

    const agentInstruction = new cdk.CfnParameter(this, 'AgentInstruction', {
      type: 'String',
      description: 'Instruction for your Bedrock Agent'
    });

    const agentDescription = new cdk.CfnParameter(this, 'AgentDescription', {
      type: 'String',
      description: 'Description for your Bedrock Agent'
    });

    const agentAliasName = new cdk.CfnParameter(this, 'AgentAliasName', {
      type: 'String',
      description: 'The name of the alias of the agent'
    });

    const agentAliasDescription = new cdk.CfnParameter(this, 'AgentAliasDescription', {
      type: 'String',
      description: 'The description of the alias of the agent'
    });

    const guardrailName = new cdk.CfnParameter(this, 'GuardrailName', {
      type: 'String',
      description: 'Name of the Bedrock Guardrail'
    });

    const guardrailVersionDescription = new cdk.CfnParameter(this, 'GuardrailVersionDescription', {
      type: 'String',
      description: 'A description of the guardrail version'
    });
    
    
    // Resources

    // Knowledge Base
    const knowledgeBase = new bedrock.CfnKnowledgeBase(this, 'KnowledgeBaseWithAoss', {
      name: knowledgeBaseName.valueAsString,
      description: knowledgeBaseDescription.valueAsString,
      roleArn: bedrockExecutionRoleArnForKnowledgeBase.valueAsString,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: embeddingModelArn.valueAsString,
        },
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: openSearchCollectionArn.valueAsString,
          vectorIndexName: aossIndexName.valueAsString,
          fieldMapping: {
            vectorField: vectorField.valueAsString,
            textField: textField.valueAsString,
            metadataField: metadataField.valueAsString,
          },
        },
      },
    });

    // DataSource
    new bedrock.CfnDataSource(this, 'DataSource', {
      knowledgeBaseId: knowledgeBase.ref,
      name: dataSourceName.valueAsString,
      dataSourceConfiguration: {
        type: 'S3',
        s3Configuration: {
          bucketArn: `arn:aws:s3:::${dataSourceBucketName.valueAsString}`,
        },
      },
      dataDeletionPolicy: 'DELETE',
    });
    
    // IAM Role for Agent
    const amazonBedrockExecutionRoleForAgentsQA = new iam.Role(this, 'AmazonBedrockExecutionRoleForAgentsQA', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess')]
    });
    
    // Create a KMS key for Agent
    const agentCMK = new kms.Key(this, 'MyCustomKMSKey', {
      description: 'Custom KMS Key for Bedrock Agent encryption',
      enableKeyRotation: true, 
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // add key policy
    agentCMK.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['kms:*'],
      resources: ['*'],
      principals: [new iam.ServicePrincipal('bedrock.amazonaws.com')],
      effect: iam.Effect.ALLOW,
    }));
    
    agentCMK.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['kms:*'],
      resources: ['*'],
      principals: [new iam.AccountRootPrincipal()],
      effect: iam.Effect.ALLOW,
    }));



    // Bedrock Agent
    const agent = new bedrock.CfnAgent(this, 'Agent', {
      agentName: agentName.valueAsString,
      agentResourceRoleArn: amazonBedrockExecutionRoleForAgentsQA.roleArn,
      autoPrepare: true,
      foundationModel: foundationModelForAgent.valueAsString,
      instruction: agentInstruction.valueAsString,
      description: agentDescription.valueAsString,
      idleSessionTtlInSeconds: 900,
      customerEncryptionKeyArn: agentCMK.keyArn,
      knowledgeBases: [
        {
          knowledgeBaseId: knowledgeBase.ref,
          description: knowledgeBaseDescription.valueAsString,
          knowledgeBaseState: 'ENABLED',
        },
      ],
    });

    // Bedrock Agent Alias
    const agentAlias = new bedrock.CfnAgentAlias(this, 'AgentAliasResource', {
      agentId: agent.ref,
      agentAliasName: agentAliasName.valueAsString,
      description: agentAliasDescription.valueAsString,
    });

    // Bedrock Guardrail
    const guardrail = new bedrock.CfnGuardrail(this, 'Guardrail', {
      blockedInputMessaging: 'Guardrail applied based on the input.',
      blockedOutputsMessaging: 'Guardrail applied based on output.',
      name: guardrailName.valueAsString,
      description: 'My Bedrock Guardrail created with AWS CFN',
      contentPolicyConfig: {
        filtersConfig: [
          {
            inputStrength: 'HIGH',
            outputStrength: 'HIGH',
            type: 'SEXUAL',
          },
          {
            inputStrength: 'HIGH',
            outputStrength: 'HIGH',
            type: 'VIOLENCE',
          },
          {
            inputStrength: 'HIGH',
            outputStrength: 'HIGH',
            type: 'HATE',
          },
          {
            inputStrength: 'HIGH',
            outputStrength: 'HIGH',
            type: 'INSULTS',
          },
          {
            inputStrength: 'HIGH',
            outputStrength: 'HIGH',
            type: 'MISCONDUCT',
          },
          {
            inputStrength: 'NONE',
            outputStrength: 'NONE',
            type: 'PROMPT_ATTACK',
          },
        ],
      },
      sensitiveInformationPolicyConfig: {
        piiEntitiesConfig: [
          {
            action: 'BLOCK',
            type: 'EMAIL',
          },
          {
            action: 'ANONYMIZE',
            type: 'IP_ADDRESS',
          },
        ],
      },
      topicPolicyConfig: {
        topicsConfig: [
          {
            definition: 'Investment advice is inquiries, guidance, or recommendations about the management or allocation of funds or assets with the goal of generating returns or achieving specific financial objectives.',
            examples: [
              'Is investing in the stocks better than bonds?',
              'Should I invest in gold?',
            ],
            name: 'Investment Advice',
            type: 'DENY',
          },
        ],
      },
      wordPolicyConfig: {
        managedWordListsConfig: [
          {
            type: 'PROFANITY',
          },
        ],
        wordsConfig: [
          {
            text: 'BLOCKTHISWORD',
          },
        ],
      },
      contextualGroundingPolicyConfig: {
        filtersConfig: [
          { threshold: 0.8, type: 'GROUNDING' },
          { threshold: 0.8, type: 'RELEVANCE' }
        ]
      },
    });

    // Bedrock Guardrail Version
    new bedrock.CfnGuardrailVersion(this, 'GuardrailVersion', {
      description: guardrailVersionDescription.valueAsString,
      guardrailIdentifier: guardrail.attrGuardrailArn
    });
  }
}
