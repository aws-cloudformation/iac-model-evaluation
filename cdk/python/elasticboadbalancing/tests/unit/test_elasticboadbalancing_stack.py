import aws_cdk as core
from aws_cdk import assertions

from elasticboadbalancing.elasticboadbalancing_stack import ElasticboadbalancingStack

def test_sqs_queue_created():
    app = core.App()
    stack = ElasticboadbalancingStack(app, "elasticboadbalancing")
    assertions.Template.from_stack(stack)
