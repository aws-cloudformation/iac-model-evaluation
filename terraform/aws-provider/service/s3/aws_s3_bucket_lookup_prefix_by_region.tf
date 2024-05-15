# create variable type map call it bucket_name_prefix, set default to map of key us-east-1, us-west-2 and us-east-2, for each key, set the value to key + prod
variable "bucket_name_prefix" {
  type = map(string)
  default = {
    us-east-1 = "us-east-1-prod"
    us-west-2 = "us-west-2-prod"
    us-east-2 = "us-east-2-prod"
  }
}

# create s3 bucket, set the bucket_prefix attribute using lookup function, lookup the bucket_name_prefix map with key as aws region
resource "aws_s3_bucket" "example" {
  bucket_prefix = "${lookup(var.bucket_name_prefix, data.aws_region.current.name)}"

}

# data source to get current aws region
data "aws_region" "current" {}