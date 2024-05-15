import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_sql_server_web.rds_sql_server_web_stack import RdsSqlServerWebStack

# example tests. To run these tests, uncomment this file along with the example
# resource in rds_sql_server_web/rds_sql_server_web_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = RdsSqlServerWebStack(app, "rds-sql-server-web")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
