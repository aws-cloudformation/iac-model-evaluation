import aws_cdk as core
import aws_cdk.assertions as assertions

from elasticloadbalancingv2_resources.elasticloadbalancingv2_resources_stack import ElasticLoadBalancingV2ResourcesStack

# example tests. To run these tests, uncomment this file along with the example
# resource in elasticloadbalancingv2_resources/elasticloadbalancingv2_resources_stack.py
def test_elbv2_stack_created():
    app = core.App()
    stack = ElasticLoadBalancingV2ResourcesStack(app, "elasticloadbalancingv2-resources")
    template = assertions.Template.from_stack(stack)
