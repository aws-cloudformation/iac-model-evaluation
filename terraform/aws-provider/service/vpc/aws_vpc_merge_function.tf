# merge tags from two variables into locales called combined_tags, use function merge to merge tags from two variables called env_tags and business_tags
locals {
  combined_tags = merge(var.env_tags, var.business_tags)
}

variable "env_tags" {
  type = map(string)
  default = {
    Environment = "Sandbox"
  }
}

variable "business_tags" {
  type = map(string)
  default = {
    BusinessUnit = "Finance"
    Application  = "Example"
  }
}

# create vpc using the combined tags
resource "aws_vpc" "example" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = local.combined_tags
}