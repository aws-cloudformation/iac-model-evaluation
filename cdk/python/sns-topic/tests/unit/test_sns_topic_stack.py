import aws_cdk as core

from aws_cdk import assertions
from sns_topic.sns_topic_stack import SnsTopicStack

# example tests. To run these tests, uncomment this file along with the example
# resource in sns_topic/sns_topic_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = SnsTopicStack(app, "sns-topic")
    assertions.Template.from_stack(stack)

    # template = assertions.Template.from_stack(stack)
    # template.has_resource_properties("AWS::SQS::Queue", {
    #     "VisibilityTimeout": 300
    # })
