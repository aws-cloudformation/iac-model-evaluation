import aws_cdk as core
import aws_cdk.assertions as assertions

from rds_oracle_ee_cdb.rds_oracle_ee_cdb_stack import RdsOracleEeCdbStack

def test_sqs_queue_created():
    app = core.App()
    stack = RdsOracleEeCdbStack(app, "rds-oracle-ee-cdb")
    template = assertions.Template.from_stack(stack)
