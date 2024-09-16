#!/usr/bin/env python3

import aws_cdk as cdk

from docdb.docdb_stack import DocDBStack


app = cdk.App()
DocDBStack(app, "DocDBStack", env=cdk.Environment(region="ap-southeast-2"))

app.synth()
