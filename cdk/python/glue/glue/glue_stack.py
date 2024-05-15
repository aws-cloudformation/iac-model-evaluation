from aws_cdk import (
    Stack,
    aws_glue as glue,
    aws_s3 as s3,
    aws_s3_deployment as s3_deployment
)
from constructs import Construct

class GlueStack(Stack):

   def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create S3 bucket using L2 and copy glue-jobs from the current directory to S3 bucket 
        # to reference in the Glue job definitions
        s3_bucket_name = "cw-deep-1983-glue-jobs"
        s3_bucket = s3.Bucket(self, s3_bucket_name,
                        bucket_name=s3_bucket_name,
                        encryption=s3.BucketEncryption.KMS_MANAGED,
                        block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
                    )

        s3_deployment.BucketDeployment(self, "CopyGlueJobs",
            sources=[s3_deployment.Source.asset("./glue-jobs")],
            destination_bucket=s3_bucket,
            destination_key_prefix="glue-jobs"
        )

        # Glue Job config
        glue_job = glue.CfnJob(self,'MyGlueJob',role="Admin",command=glue.CfnJob.JobCommandProperty(
            name="python",
            script_location='s3://{}/glue-jobs/hellogluejob.py'.format(s3_bucket.bucket_name),
            ),
            timeout=1440,
        )
                   



      

       
