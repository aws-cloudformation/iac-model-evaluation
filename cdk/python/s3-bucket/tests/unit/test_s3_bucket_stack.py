import aws_cdk as core
from aws_cdk import assertions

from s3_bucket.s3_bucket_stack import S3BucketStack

# example tests. To run these tests, uncomment this file along with the example
# resource in s3_bucket/s3_bucket_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = S3BucketStack(app, "s3-bucket")
    assertions.Template.from_stack(stack)
