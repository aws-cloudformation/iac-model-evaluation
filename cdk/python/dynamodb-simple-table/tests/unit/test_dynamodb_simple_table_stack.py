import aws_cdk as core
import aws_cdk.assertions as assertions

from dynamodb_simple_table.dynamodb_simple_table_stack import DynamodbSimpleTableStack

# example tests. To run these tests, uncomment this file along with the example
# resource in dynamodb_simple_table/dynamodb_simple_table_stack.py
def test_dynamodb_simple_table_created():
    app = core.App()
    stack = DynamodbSimpleTableStack(app, "dynamodb-simple-table")
    template = assertions.Template.from_stack(stack)
