import aws_cdk as core
from aws_cdk import assertions

from cloudfront.cloudfront_stack import CloudfrontStack

def test_cloudfront_distribution_created():
    app = core.App()
    stack = CloudfrontStack(app, "cloudfront")
    assertions.Template.from_stack(stack)
