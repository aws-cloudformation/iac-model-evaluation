# Terraform code to create an S3 bucket named 'example' via the 'aws' provider

resource "aws_s3_bucket" "example" {
  bucket = "example" # must be globally unique name

}
