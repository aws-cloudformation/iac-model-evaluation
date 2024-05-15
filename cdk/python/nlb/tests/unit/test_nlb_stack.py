import aws_cdk as core
import aws_cdk.assertions as assertions

from nlb.nlb_stack import NlbStack

# example tests. To run these tests, uncomment this file along with the example
# resource in nlb/nlb_stack.py
def test_nlb():
    app = core.App()
    stack = NlbStack(app, "nlb")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
