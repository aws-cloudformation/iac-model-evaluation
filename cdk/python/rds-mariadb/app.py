#!/usr/bin/env python3
import aws_cdk as cdk

from rds_mariadb.rds_mariadb_stack import RdsMariadbStack


app = cdk.App()
RdsMariadbStack(app, "RdsMariadbStack",
    )

app.synth()
