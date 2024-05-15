# Terraform code to create an S3 Bucket named 'example' via 'awscc' provider

resource "awscc_s3_bucket" "example" {
  // (Optional) Desired bucket name - must be globally unique value. If not specified,
  // AWS CloudFormation will generate a unique ID and use that for the bucket name
  bucket_name = "example"

  // (Optional) Enforce restrctions on public access for the bucket
  public_access_block_configuration = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

}
