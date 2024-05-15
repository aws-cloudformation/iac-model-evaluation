import aws_cdk as core
from aws_cdk import assertions

from elasticboadbalancingv2_alb.elasticboadbalancingv2_alb_stack import Elasticboadbalancingv2AlbStack

def test_sqs_queue_created():
    app = core.App()
    stack = Elasticboadbalancingv2AlbStack(app, "elasticboadbalancingv2-alb")
    assertions.Template.from_stack(stack)
