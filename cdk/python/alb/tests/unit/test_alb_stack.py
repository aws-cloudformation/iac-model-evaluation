import aws_cdk as core
import aws_cdk.assertions as assertions

from alb.alb_stack import AlbStack

# example tests. To run these tests, uncomment this file along with the example
# resource in alb/alb_stack.py
def test_alb():
    app = core.App()
    stack = AlbStack(app, "alb")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
