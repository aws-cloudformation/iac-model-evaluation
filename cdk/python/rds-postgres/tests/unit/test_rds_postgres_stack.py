import aws_cdk as core
from aws_cdk import assertions

from rds_postgres.rds_postgres_stack import RdsPostgresStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsPostgresStack(app, "rds-postgres")
    assertions.Template.from_stack(stack)
