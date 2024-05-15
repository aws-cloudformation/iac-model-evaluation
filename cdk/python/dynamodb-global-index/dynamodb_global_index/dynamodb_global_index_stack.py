from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
)
from constructs import Construct

class DynamodbGlobalIndexStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create a dynamodb table
        table = dynamodb.Table(self, "Table",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING)
        )
        
        # Add a global secondary index to dynamodb table
        table.add_global_secondary_index(
            index_name = "index_name",
            partition_key = dynamodb.Attribute(name="partition_key", type=dynamodb.AttributeType.STRING)
            )

