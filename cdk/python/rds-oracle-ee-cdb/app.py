#!/usr/bin/env python3
import aws_cdk as cdk

from rds_oracle_ee_cdb.rds_oracle_ee_cdb_stack import RdsOracleEeCdbStack


app = cdk.App()
RdsOracleEeCdbStack(app, "RdsOracleEeCdbStack",
    )

app.synth()
