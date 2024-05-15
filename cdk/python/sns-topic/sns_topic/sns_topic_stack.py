from aws_cdk import (
    # Duration,
    Stack,
    aws_sns as sns,
    aws_kms as kms,
)
from constructs import Construct

class SnsTopicStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        sns_topic_key = kms.Key(self, "CDKExampleSNSTopicKey",
                enable_key_rotation=True
                )

        sns.Topic(self, "CDKExampleSNSTopic",
                  master_key=sns_topic_key
                  )
