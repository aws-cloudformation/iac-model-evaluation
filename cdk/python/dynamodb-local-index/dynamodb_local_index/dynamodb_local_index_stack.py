from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
)
from constructs import Construct

class DynamodbLocalIndexStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create a dynamodb table with a sort key
        table = dynamodb.Table(self, "Table",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="sort_key", type=dynamodb.AttributeType.STRING)
        )
        
        # Add a global secondary index to dynamodb table
        table.add_local_secondary_index(
            index_name = "local_index_name",
            sort_key = dynamodb.Attribute(name="local_index_sort_key", type=dynamodb.AttributeType.STRING)
            )
