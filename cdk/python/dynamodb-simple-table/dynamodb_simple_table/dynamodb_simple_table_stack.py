from aws_cdk import (
    Stack,
    aws_dynamodb as dynamodb,
)
from constructs import Construct

class DynamodbSimpleTableStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create a dynamodb table
        table = dynamodb.Table(self, "Table",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING)
        )
