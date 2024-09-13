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
    
    //OpenSearch Service Serverless (AOSS) collection ARN.'
    const openSearchCollectionArn = 'arn:aws:aoss:us-east-1:<account_id>:collection/<uuid>'; 

    //Knowledge Base Model Arn, can use \'aws bedrock list-foundation-models\' to get'
    const embeddingModelArn = 'arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v1'; 

    //Name of the vector index in the Amazon OpenSearch Service Serverless (AOSS) collection.
    const aossIndexName = 'sample-index-name';

    //Provide a name for the field
    const vectorField = 'sample-vector';

    //Provide additional information that a knowledge base can retrieve with vectors
    const textField = 'sample-text-filed';

    //Provide additional metadata that a knowledge base can retrieve with vectors
    const metadataField = 'sample-metadata';
    
    //The name of the knowledge base
    const knowledgeBaseName = 'sample-bedrock-knowledgebase';

    //The knowledge base execution role-arn which is being trusted by your Opensearch serverless collection access-policy
    const bedrockExecutionRoleArnForKnowledgeBase = 'arn:aws:iam::<account_id>:role/<role-name>';
    
    //The description of the knowledge base
    const knowledgeBaseDescription = 'Answer based only on information contained in knowledge base';
    
    //Name of the Bedrock DataSource
    const dataSourceName = 'sample-bedrock-datasourc';
    
    //Name of the S3 bucket which stored the DataSource
    const dataSourceBucketName = 'sample-bucket-name';
    
    //Name of the Bedrock Agent
    const agentName = 'sample-agent-name';

    //Foundation Model which will be used by your Bedrock Agent
    const foundationModelForAgent = 'anthropic.claude-v2';
    
    //Instruction for your Bedrock Agent
    const agentInstruction = 'You are a Q&A bot to answer questions on Amazon SageMaker';

    //Description for your Bedrock Agent
    const agentDescription = 'Agent description is here';
    
    //The name of the alias of the agent
    const agentAliasName = 'sample-agent-alias-name';

    //The description of the alias of the agent
    const agentAliasDescription = 'Alias for testing';
    
    //Name of the Bedrock Guardrail
    const guardrailName = 'sample-guardrail-name';
    
    //A description of the guardrail version
    const guardrailVersionDescription = 'bedrock guardrail new version'
    
    
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
