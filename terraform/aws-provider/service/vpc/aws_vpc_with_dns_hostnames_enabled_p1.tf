# Create a VPC named 'example' with cidr_block '10.0.0.0/16' and dns host names enabled via the 'aws' provider

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

}
