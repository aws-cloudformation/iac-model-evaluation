#!/usr/bin/env python3
import aws_cdk as cdk

from rds_aurora_serverlessv2_postgres.rds_aurora_serverlessv2_postgres_stack import RdsAuroraServerlessv2PostgresStack


app = cdk.App()
RdsAuroraServerlessv2PostgresStack(app, "RdsAuroraServerlessv2PostgresStack",
    )

app.synth()
