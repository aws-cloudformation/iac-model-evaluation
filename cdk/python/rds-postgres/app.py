#!/usr/bin/env python3

import aws_cdk as cdk

from rds_postgres.rds_postgres_stack import RdsPostgresStack


app = cdk.App()
RdsPostgresStack(app, "RdsPostgresStack",
    )

app.synth()
