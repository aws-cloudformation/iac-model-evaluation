import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_sql_server_ee.rds_sql_server_ee_stack import RdsSqlServerEeStack

# example tests. To run these tests, uncomment this file along with the example
# resource in rds_sql_server_ee/rds_sql_server_ee_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = RdsSqlServerEeStack(app, "rds-sql-server-ee")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
