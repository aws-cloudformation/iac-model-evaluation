import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_mariadb.rds_mariadb_stack import RdsMariadbStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsMariadbStack(app, "rds-mariadb")
    assertions.Template.from_stack(stack)
