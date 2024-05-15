import aws_cdk as core
from aws_cdk import assertions

from route53.route53_stack import Route53Stack

def test_route53_stack_created():
    app = core.App()
    stack = Route53Stack(app, "route53")
    template = assertions.Template.from_stack(stack)
