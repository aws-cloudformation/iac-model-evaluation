#!/usr/bin/env python3

import aws_cdk as cdk

from image_builder.image_builder_stack import ImageBuilderStack


app = cdk.App()
ImageBuilderStack(app, "ImageBuilderStack")

app.synth()
