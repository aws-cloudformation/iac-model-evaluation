import aws_cdk as core
from aws_cdk import assertions

from rds_aurora_mysql.rds_aurora_mysql_stack import RdsAuroraMysqlStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsAuroraMysqlStack(app, "rds-aurora-mysql")
    assertions.Template.from_stack(stack)
