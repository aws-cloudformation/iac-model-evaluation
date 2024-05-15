# Create example resource for three S3 buckets using for_each, where the bucket prefix are in variable with list containing [prod, staging, dev]

resource "aws_s3_bucket" "example" {
  for_each      = toset(var.names)
  bucket_prefix = each.value
}

variable "names" {
  type    = list(string)
  default = ["prod", "staging", "dev"]
}