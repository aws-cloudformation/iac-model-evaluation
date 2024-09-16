import aws_cdk as core
import aws_cdk.assertions as assertions
from docdb.docdb_stack import DocDBStack


def test_docdb_stack_created():
    app = core.App()
    stack = DocDBStack(app, "TestDocDBStack")
    assertions.Template.from_stack(stack)