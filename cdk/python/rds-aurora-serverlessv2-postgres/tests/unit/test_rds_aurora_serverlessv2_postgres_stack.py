import aws_cdk as core

from aws_cdk import assertions
from rds_aurora_serverlessv2_postgres.rds_aurora_serverlessv2_postgres_stack import RdsAuroraServerlessv2PostgresStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsAuroraServerlessv2PostgresStack(app, "rds-aurora-serverlessv2-postgres")
    assertions.Template.from_stack(stack)
