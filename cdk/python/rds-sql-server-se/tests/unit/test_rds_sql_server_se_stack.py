import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_sql_server_se.rds_sql_server_se_stack import RdsSqlServerSeStack

# example tests. To run these tests, uncomment this file along with the example
# resource in rds_sql_server_se/rds_sql_server_se_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = RdsSqlServerSeStack(app, "rds-sql-server-se")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
