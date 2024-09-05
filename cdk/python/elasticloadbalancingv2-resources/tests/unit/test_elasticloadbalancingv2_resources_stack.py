import aws_cdk as core
import aws_cdk.assertions as assertions

from elasticloadbalancingv2_resources.elasticloadbalancingv2_resources_stack import Elasticloadbalancingv2ResourcesStack

# example tests. To run these tests, uncomment this file along with the example
# resource in elasticloadbalancingv2_resources/elasticloadbalancingv2_resources_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = Elasticloadbalancingv2ResourcesStack(app, "elasticloadbalancingv2-resources")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
