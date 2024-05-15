from aws_cdk import (
    # Duration,
    Stack,
    aws_sqs as sqs,
)
from constructs import Construct

class SqsQueueStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # SQS Queue that passes linting and security checks
        queue = sqs.Queue(
            self,
            "test-queue-cw-iac-examples",
            encryption=sqs.QueueEncryption.KMS_MANAGED,
            enforce_ssl=True,
        )
