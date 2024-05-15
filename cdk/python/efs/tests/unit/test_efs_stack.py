import aws_cdk as core
from aws_cdk import assertions

from efs.efs_stack import EfsStack

def test_efs_filesystem_created():
    app = core.App()
    stack = EfsStack(app, "efs")
    assertions.Template.from_stack(stack)
