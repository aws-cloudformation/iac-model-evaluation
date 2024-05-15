import aws_cdk as core
import aws_cdk.assertions as assertions

from glue.glue_stack import GlueStack

def test_gluestack():
    app = core.App()
    stack = GlueStack(app, "Glue-Stack")
    template = assertions.Template.from_stack(stack)
    template.has_resource_properties("AWS::Glue::Job", {
        "Timeout": 1440
    })

