#!/usr/bin/env python3
import aws_cdk as cdk

from rds_oracle_ee.rds_oracle_ee_stack import RdsOracleEeStack


app = cdk.App()
RdsOracleEeStack(app, "RdsOracleEeStack",
    )

app.synth()
