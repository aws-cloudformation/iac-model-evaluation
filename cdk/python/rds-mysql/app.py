#!/usr/bin/env python3
import aws_cdk as cdk

from rds_mysql.rds_mysql_stack import RdsMysqlStack


app = cdk.App()
RdsMysqlStack(app, "RdsMysqlStack",
    )

app.synth()
