# - Trust Relationships -
data "aws_iam_policy_document" "ec2_trust_relationship" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "random_string" "example" {
  length  = 4
  special = false
  upper   = false
}

# - IAM Role -
resource "aws_iam_role" "example" {
  name                = "example-prod-resource-${random_string.example.result}"
  assume_role_policy  = data.aws_iam_policy_document.ec2_trust_relationship.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"]

  force_detach_policies = true
}

# - S3 Bucket -
resource "aws_s3_bucket" "example" {
  bucket_prefix = "example-prod-resource"
  force_destroy = true
}
