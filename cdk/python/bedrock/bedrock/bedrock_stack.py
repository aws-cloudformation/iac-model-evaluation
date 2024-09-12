from aws_cdk import (
    Stack,
    CfnParameter,
    RemovalPolicy,
    aws_kms as kms,
    aws_iam as iam,
    aws_s3 as s3,
    aws_bedrock as bedrock

)
from constructs import Construct

class BedrockStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

       # Parameters
       
        #OpenSearch Service Serverless (AOSS) collection ARN.'
        open_search_collection_arn = 'arn:aws:aoss:us-east-1:<account_id>:collection/<uuid>'; 
    
        #Knowledge Base Model Arn, can use \'aws bedrock list-foundation-models\' to get'
        embedding_model_arn = 'arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v1'; 
    
        #Name of the vector index in the Amazon OpenSearch Service Serverless (AOSS) collection.
        aoss_index_name = 'sample-index-name';
    
        #Provide a name for the field
        vector_field = 'sample-vector';
    
        #Provide additional information that a knowledge base can retrieve with vectors
        text_field = 'sample-text-filed';
    
        #Provide additional metadata that a knowledge base can retrieve with vectors
        metadata_field = 'sample-metadata';
        
        #The name of the knowledge base
        knowledge_base_name = 'sample-bedrock-knowledgebase';
    
        #The knowledge base execution role-arn which is being trusted by your Opensearch serverless collection access-policy
        bedrock_execution_role_arn_for_knowledge_base = 'arn:aws:iam::<account_id>:role/<role-name>';
        
        #The description of the knowledge base
        knowledge_base_description = 'Answer based only on information contained in knowledge base';
        
        #Name of the Bedrock DataSource
        data_source_name = 'sample-bedrock-datasourc';
        
        #Name of the S3 bucket which stored the DataSource
        data_source_bucket_name = 'sample-bucket-name';
        
        #Name of the Bedrock Agent
        agent_name = 'sample-agent-name';
    
        #Foundation Model which will be used by your Bedrock Agent
        foundation_model_for_agent = 'anthropic.claude-v2';
        
        #Instruction for your Bedrock Agent
        agent_instruction = 'You are a Q&A bot to answer questions on Amazon SageMaker';
    
        #Description for your Bedrock Agent
        agent_description = 'Agent description is here';
        
        #The name of the alias of the agent
        agent_alias_name = 'sample-agent-alias-name';
    
        #The description of the alias of the agent
        agent_alias_description = 'Alias for testing';
        
        #Name of the Bedrock Guardrail
        guardrail_name = 'sample-guardrail-name';
        
        #A description of the guardrail version
        guardrail_version_description = 'bedrock guardrail new version'
        

        # Resources

        # Knowledge Base
        knowledge_base = bedrock.CfnKnowledgeBase(self, 'KnowledgeBaseWithAoss',
            name=knowledge_base_name,
            description=knowledge_base_description,
            role_arn=bedrock_execution_role_arn_for_knowledge_base,
            knowledge_base_configuration={
                'type': 'VECTOR',
                'vectorKnowledgeBaseConfiguration': {
                    'embeddingModelArn': embedding_model_arn
                }
            },
            storage_configuration={
                'type': 'OPENSEARCH_SERVERLESS',
                'opensearchServerlessConfiguration': {
                    'collectionArn': open_search_collection_arn,
                    'vectorIndexName': aoss_index_name,
                    'fieldMapping': {
                        'vectorField': vector_field,
                        'textField': text_field,
                        'metadataField': metadata_field
                    }
                }
            }
        )

        # DataSource
        datasource = bedrock.CfnDataSource(self, 'DataSource',
            knowledge_base_id=knowledge_base.ref,
            name=data_source_name,
            data_source_configuration={
                'type': 'S3',
                's3Configuration': {
                    'bucketArn': f'arn:aws:s3:::{data_source_bucket_name}'
                }
            },
            data_deletion_policy='DELETE'
        )

        # IAM Role for Agent
        amazon_bedrock_execution_role_for_agents_qa = iam.Role(self, 'AmazonBedrockExecutionRoleForAgentsQA',
            assumed_by=iam.ServicePrincipal('bedrock.amazonaws.com'),
            managed_policies=[iam.ManagedPolicy.from_aws_managed_policy_name('AmazonBedrockFullAccess')]
        )

        # Create a KMS key for Agent
        agent_cmk = kms.Key(self, 'MyCustomKMSKey',
            description='Custom KMS Key for Bedrock Agent encryption',
            enable_key_rotation=True,
            removal_policy=RemovalPolicy.DESTROY
        )

        # Add key policy
        agent_cmk.add_to_resource_policy(iam.PolicyStatement(
            actions=['kms:*'],
            resources=['*'],
            principals=[iam.ServicePrincipal('bedrock.amazonaws.com')],
            effect=iam.Effect.ALLOW
        ))

        agent_cmk.add_to_resource_policy(iam.PolicyStatement(
            actions=['kms:*'],
            resources=['*'],
            principals=[iam.AccountRootPrincipal()],
            effect=iam.Effect.ALLOW
        ))

        # Bedrock Agent
        agent = bedrock.CfnAgent(self, 'Agent',
            agent_name=agent_name,
            agent_resource_role_arn=amazon_bedrock_execution_role_for_agents_qa.role_arn,
            auto_prepare=True,
            foundation_model=foundation_model_for_agent,
            instruction=agent_instruction,
            description=agent_description,
            idle_session_ttl_in_seconds=900,
            customer_encryption_key_arn=agent_cmk.key_arn,
            knowledge_bases=[{
                'knowledgeBaseId': knowledge_base.ref,
                'description': knowledge_base_description,
                'knowledgeBaseState': 'ENABLED'
            }]
        )

        # Bedrock Agent Alias
        agent_alias = bedrock.CfnAgentAlias(self, 'AgentAliasResource',
            agent_id=agent.ref,
            agent_alias_name=agent_alias_name,
            description=agent_alias_description
        )

        # Bedrock Guardrail
        guardrail = bedrock.CfnGuardrail(self, 'Guardrail',
            blocked_input_messaging='Guardrail applied based on the input.',
            blocked_outputs_messaging='Guardrail applied based on output.',
            name=guardrail_name,
            description='My Bedrock Guardrail created with AWS CFN',
            content_policy_config={
                'filtersConfig': [
                    {'inputStrength': 'HIGH', 'outputStrength': 'HIGH', 'type': 'SEXUAL'},
                    {'inputStrength': 'HIGH', 'outputStrength': 'HIGH', 'type': 'VIOLENCE'},
                    {'inputStrength': 'HIGH', 'outputStrength': 'HIGH', 'type': 'HATE'},
                    {'inputStrength': 'HIGH', 'outputStrength': 'HIGH', 'type': 'INSULTS'},
                    {'inputStrength': 'HIGH', 'outputStrength': 'HIGH', 'type': 'MISCONDUCT'},
                    {'inputStrength': 'NONE', 'outputStrength': 'NONE', 'type': 'PROMPT_ATTACK'}
                ]
            },
            sensitive_information_policy_config={
                'piiEntitiesConfig': [
                    {'action': 'BLOCK', 'type': 'EMAIL'},
                    {'action': 'ANONYMIZE', 'type': 'IP_ADDRESS'}
                ]
            },
            topic_policy_config={
                'topicsConfig': [
                    {
                        'definition': 'Investment advice is inquiries, guidance, or recommendations about the management or allocation of funds or assets with the goal of generating returns or achieving specific financial objectives.',
                        'examples': [
                            'Is investing in the stocks better than bonds?',
                            'Should I invest in gold?'
                        ],
                        'name': 'Investment Advice',
                        'type': 'DENY'
                    }
                ]
            },
            word_policy_config={
                'managedWordListsConfig': [
                    {'type': 'PROFANITY'}
                ],
                'wordsConfig': [
                    {'text': 'BLOCKTHISWORD'}
                ]
            },
            contextual_grounding_policy_config={
                'filtersConfig': [
                    {'threshold': 0.8, 'type': 'GROUNDING'},
                    {'threshold': 0.8, 'type': 'RELEVANCE'}
                ]
            }
        )

        # Bedrock Guardrail Version
        guardrail_version = bedrock.CfnGuardrailVersion(self, 'GuardrailVersion',
            description=guardrail_version_description,
            guardrail_identifier=guardrail.attr_guardrail_arn
        )