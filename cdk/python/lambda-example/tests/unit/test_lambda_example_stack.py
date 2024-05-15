import aws_cdk as core
import aws_cdk.assertions as assertions

from lambda_example.lambda_example_stack import LambdaExampleStack

# example tests. To run these tests, uncomment this file along with the example
# resource in lambda_example/lambda_example_stack.py
def test_lambda_created():
    app = core.App()
    stack = LambdaExampleStack(app, "lambda-example")
    template = assertions.Template.from_stack(stack)