import aws_cdk as core
from aws_cdk import assertions

from iam.iam_stack import IamStack

def test_iam_stack_created():
    app = core.App()
    stack = IamStack(app, "iam")
    assertions.Template.from_stack(stack)
