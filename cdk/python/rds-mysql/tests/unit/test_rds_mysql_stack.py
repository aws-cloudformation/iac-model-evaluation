import aws_cdk as core

from aws_cdk import assertions
from rds_mysql.rds_mysql_stack import RdsMysqlStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsMysqlStack(app, "rds-mysql")
    assertions.Template.from_stack(stack)
