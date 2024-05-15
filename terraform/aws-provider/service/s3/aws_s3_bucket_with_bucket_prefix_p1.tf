# Create an S3 bucket with bucket_prefix 'example' via the 'aws' provider

resource "aws_s3_bucket" "example" {
  bucket_prefix = "example"

}
