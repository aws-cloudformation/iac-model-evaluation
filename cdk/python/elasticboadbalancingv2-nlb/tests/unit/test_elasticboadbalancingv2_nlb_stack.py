import aws_cdk as core
from aws_cdk import assertions

from elasticboadbalancingv2_nlb.elasticboadbalancingv2_nlb_stack import Elasticboadbalancingv2NlbStack

def test_nlb_stack_created():
    app = core.App()
    stack = Elasticboadbalancingv2NlbStack(app, "elasticboadbalancingv2-nlb")
    assertions.Template.from_stack(stack)
