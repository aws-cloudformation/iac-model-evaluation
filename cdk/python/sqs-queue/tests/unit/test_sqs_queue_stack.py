import aws_cdk as core
from aws_cdk import assertions

from sqs_queue.sqs_queue_stack import SqsQueueStack

def test_sqs_queue_created():
    app = core.App()
    stack = SqsQueueStack(app, "sqs-queue")
    assertions.Template.from_stack(stack)
