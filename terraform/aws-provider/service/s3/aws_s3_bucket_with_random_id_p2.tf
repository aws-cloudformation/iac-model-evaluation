# Terraform code to create an S3 bucket and assign a unique bucket name with prefix 'example' via 'aws' provider

resource "random_id" "example" {
  prefix      = "example"
  byte_length = 12
}
resource "aws_s3_bucket" "example" {
  bucket = random_id.example.id

}

# (Recommended) Enforce restrctions on public access for the bucket
resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
