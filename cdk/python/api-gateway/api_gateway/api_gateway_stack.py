from aws_cdk import (
    Stack,
    aws_apigateway as apigateway,
    aws_lambda as _lambda
)
from constructs import Construct

# Serverless CDK Stack
class ServerlessStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)
        
        #Create the receiving lambda function
        my_lambda = _lambda.Function(
            self, 'HelloHandler',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_asset('lambda'),
            handler='hello.handler',
        )
        
        #Create the API Gateway
        apigateway.LambdaRestApi(self, "myapi",
            handler=my_lambda,
        )
