import aws_cdk as core

from aws_cdk import assertions
from rds_aurora_serverlessv2.rds_aurora_serverlessv2_stack import RdsAuroraServerlessv2Stack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsAuroraServerlessv2Stack(app, "rds-aurora-serverlessv2")
    assertions.Template.from_stack(stack)
