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
        open_search_collection_arn = CfnParameter(self, 'OpenSearchCollectionARN',
            type='String',
            description='OpenSearch Service Serverless (AOSS) collection ARN.'
        )

        embedding_model_arn = CfnParameter(self, 'EmbeddingModelArn',
            type='String',
            description='Knowledge Base Model Arn, can use \'aws bedrock list-foundation-models\' to get'
        )

        aoss_index_name = CfnParameter(self, 'AOSSIndexName',
            type='String',
            description='Name of the vector index in the Amazon OpenSearch Service Serverless (AOSS) collection.'
        )

        vector_field = CfnParameter(self, 'VectorField',
            type='String',
            description='Provide a name for the field'
        )

        text_field = CfnParameter(self, 'TextField',
            type='String',
            description='Provide additional information that a knowledge base can retrieve with vectors'
        )

        metadata_field = CfnParameter(self, 'MetadataField',
            type='String',
            description='Provide additional metadata that a knowledge base can retrieve with vectors'
        )

        knowledge_base_name = CfnParameter(self, 'KnowledgeBaseName',
            type='String',
            description='The name of the knowledge base.'
        )

        bedrock_execution_role_arn_for_knowledge_base = CfnParameter(self, 'BedrockExecutionRoleARNForKnowledgeBase',
            type='String',
            description='The knowledge base execution role-arn which is being trusted by your Opensearch serverless collection access-policy.'
        )

        knowledge_base_description = CfnParameter(self, 'KnowledgeBaseDescription',
            type='String',
            description='The description of the knowledge base.'
        )

        data_source_name = CfnParameter(self, 'DataSourceName',
            type='String',
            description='Name of the Bedrock DataSource'
        )

        data_source_bucket_name = CfnParameter(self, 'DataSourceBucketName',
            type='String',
            description='Name of the S3 bucket which stored the DataSource'
        )

        agent_name = CfnParameter(self, 'AgentName',
            type='String',
            description='Name of the Bedrock Agent'
        )

        foundation_model_for_agent = CfnParameter(self, 'FoundationModelForAgent',
            type='String',
            description='Foundation Model which will be used by your Bedrock Agent'
        )

        agent_instruction = CfnParameter(self, 'AgentInstruction',
            type='String',
            description='Instruction for your Bedrock Agent'
        )

        agent_description = CfnParameter(self, 'AgentDescription',
            type='String',
            description='Description for your Bedrock Agent'
        )

        agent_alias_name = CfnParameter(self, 'AgentAliasName',
            type='String',
            description='The name of the alias of the agent'
        )

        agent_alias_description = CfnParameter(self, 'AgentAliasDescription',
            type='String',
            description='The description of the alias of the agent'
        )

        guardrail_name = CfnParameter(self, 'GuardrailName',
            type='String',
            description='Name of the Bedrock Guardrail'
        )

        guardrail_version_description = CfnParameter(self, 'GuardrailVersionDescription',
            type='String',
            description='A description of the guardrail version'
        )

        # Resources

        # Knowledge Base
        knowledge_base = bedrock.CfnKnowledgeBase(self, 'KnowledgeBaseWithAoss',
            name=knowledge_base_name.value_as_string,
            description=knowledge_base_description.value_as_string,
            role_arn=bedrock_execution_role_arn_for_knowledge_base.value_as_string,
            knowledge_base_configuration={
                'type': 'VECTOR',
                'vectorKnowledgeBaseConfiguration': {
                    'embeddingModelArn': embedding_model_arn.value_as_string
                }
            },
            storage_configuration={
                'type': 'OPENSEARCH_SERVERLESS',
                'opensearchServerlessConfiguration': {
                    'collectionArn': open_search_collection_arn.value_as_string,
                    'vectorIndexName': aoss_index_name.value_as_string,
                    'fieldMapping': {
                        'vectorField': vector_field.value_as_string,
                        'textField': text_field.value_as_string,
                        'metadataField': metadata_field.value_as_string
                    }
                }
            }
        )

        # DataSource
        bedrock.CfnDataSource(self, 'DataSource',
            knowledge_base_id=knowledge_base.ref,
            name=data_source_name.value_as_string,
            data_source_configuration={
                'type': 'S3',
                's3Configuration': {
                    'bucketArn': f'arn:aws:s3:::{data_source_bucket_name.value_as_string}'
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
            agent_name=agent_name.value_as_string,
            agent_resource_role_arn=amazon_bedrock_execution_role_for_agents_qa.role_arn,
            auto_prepare=True,
            foundation_model=foundation_model_for_agent.value_as_string,
            instruction=agent_instruction.value_as_string,
            description=agent_description.value_as_string,
            idle_session_ttl_in_seconds=900,
            customer_encryption_key_arn=agent_cmk.key_arn,
            knowledge_bases=[{
                'knowledgeBaseId': knowledge_base.ref,
                'description': knowledge_base_description.value_as_string,
                'knowledgeBaseState': 'ENABLED'
            }]
        )

        # Bedrock Agent Alias
        bedrock.CfnAgentAlias(self, 'AgentAliasResource',
            agent_id=agent.ref,
            agent_alias_name=agent_alias_name.value_as_string,
            description=agent_alias_description.value_as_string
        )

        # Bedrock Guardrail
        guardrail = bedrock.CfnGuardrail(self, 'Guardrail',
            blocked_input_messaging='Guardrail applied based on the input.',
            blocked_outputs_messaging='Guardrail applied based on output.',
            name=guardrail_name.value_as_string,
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
        bedrock.CfnGuardrailVersion(self, 'GuardrailVersion',
            description=guardrail_version_description.value_as_string,
            guardrail_identifier=guardrail.attr_guardrail_arn
        )