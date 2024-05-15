from aws_cdk import (
    Stack,
    aws_lambda as lambda_
)
from constructs import Construct
from os import path

class LambdaExampleStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create a lambda function in python
        my_lambda = lambda_.Function(self, "MyLambdaFunction",
                    handler = "index.lambda_handler",
                    code = lambda_.Code.from_asset(path.join(path.dirname(__file__),"lambda-handler")),
                    runtime = lambda_.Runtime.PYTHON_3_11,
        )

        