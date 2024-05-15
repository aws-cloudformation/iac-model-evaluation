from aws_cdk import (
    # Duration,
    Stack,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3 as s3,
    aws_certificatemanager as acm,
)
from constructs import Construct

class CloudfrontStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/11-3336f1-44483d-adc7-9cd375c5169d"

        # Create a HTTPS only CloudFront distribution with WAF from an S3 Bucket origin that passes security and linting checks
        # Use mywebsitebucket as the bucket name and index.html as the default root object
        # Use mybackupsite.com as the fallback origin
        cloudfront.Distribution(
            self,
            "MyCloudFrontDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.OriginGroup(
                    primary_origin=origins.S3Origin(s3.Bucket.from_bucket_name(self, "s3WebsiteBucketImport", "mywebsitebucket")),
                    fallback_origin=origins.HttpOrigin("mybackupsite.com"),
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
            ),
            log_bucket=s3.Bucket.from_bucket_name(self, "s3LogBucketImport", "mylogbucket"),
            certificate=acm.Certificate.from_certificate_arn(
                self,
                "importedCert",
                certificate_arn,
            ),
            domain_names=["mywebsite.com"],
            default_root_object="index.html",
            web_acl_id="arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/473e64fd-f30b-4765-81a0-62ad96dd167a",
        )
        
