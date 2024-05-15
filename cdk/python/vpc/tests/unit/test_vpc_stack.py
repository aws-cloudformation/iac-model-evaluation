import aws_cdk as core
import aws_cdk.assertions as assertions

from vpc.vpc_stack import VpcStack

# example tests. To run these tests, uncomment this file along with the example
# resource in vpc/vpc_stack.py
def test_vpc_created():
    app = core.App()
    stack = VpcStack(app, "vpc")
    template = assertions.Template.from_stack(stack)
