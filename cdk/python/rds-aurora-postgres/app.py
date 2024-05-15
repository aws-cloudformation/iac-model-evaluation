#!/usr/bin/env python3
import aws_cdk as cdk

from rds_aurora_postgres.rds_aurora_postgres_stack import RdsAuroraPostgresStack


app = cdk.App()
RdsAuroraPostgresStack(app, "RdsAuroraPostgresStack",
)

app.synth()
