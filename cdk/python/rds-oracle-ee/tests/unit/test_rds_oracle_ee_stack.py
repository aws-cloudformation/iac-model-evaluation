import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_oracle_ee.rds_oracle_ee_stack import RdsOracleEeStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsOracleEeStack(app, "rds-oracle-ee")
    assertions.Template.from_stack(stack)
