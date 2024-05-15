#!/usr/bin/env python3
import aws_cdk as cdk

from rds_aurora_serverlessv2.rds_aurora_serverlessv2_stack import RdsAuroraServerlessv2Stack


app = cdk.App()
RdsAuroraServerlessv2Stack(app, "RdsAuroraServerlessv2Stack",
)

app.synth()
