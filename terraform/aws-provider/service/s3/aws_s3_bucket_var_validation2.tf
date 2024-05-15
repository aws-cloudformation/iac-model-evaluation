# create variable called bucket name, setup validation to make sure bucket name is between 10 - 20 chars with no special chars, use the variable in the s3 bucket resource
variable "bucket_name" {
  type = string
  validation {
    condition = length(var.bucket_name) >= 10 && length(var.bucket_name) <= 20
    error_message = "Bucket name must be between 10 and 20 characters"
  }
  validation {
    condition = can(regex("^[a-zA-Z0-9]*$", var.bucket_name))
    error_message = "Bucket name must contain only alphanumeric characters"
  }
}

resource "aws_s3_bucket" "example" {
  bucket = var.bucket_name
}
