# create s3 bucket with Terraform AWSCC, if the var name_length is bigger than 0, then use random pet for bucket name, otherwise set bucket name as var bucket_name
resource "awscc_s3_bucket" "example" {
  bucket_name = var.name_length > 0 ? random_pet.example.id : var.bucket_name
}

variable "bucket_name" {
  type    = string
  default = ""
}

variable "name_length" {
  type    = number
  default = 2
}

resource "random_pet" "example" {
  keepers = {
    length = var.name_length
  }
  length = var.name_length
}