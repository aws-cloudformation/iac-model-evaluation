import aws_cdk as core
from aws_cdk import assertions

from rds_aurora_postgres.rds_aurora_postgres_stack import RdsAuroraPostgresStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsAuroraPostgresStack(app, "rds-aurora-postgres")
    assertions.Template.from_stack(stack)
