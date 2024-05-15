# Terraform code to create a VPC named 'example' with cidr_block '10.0.0.0/16' and instance_tenancy 'dedicated' via the 'aws' provider

resource "aws_vpc" "main" {
  cidr_block       = "10.0.0.0/16"
  instance_tenancy = "dedicated"

}
