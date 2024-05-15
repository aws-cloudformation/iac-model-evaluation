# create vpc using AWSCC terraform provider. If the var cidr_block is not empty and var use_ipam is false, set cidr_block from the var, otherwise use ipam 
resource "awscc_ec2_vpc" "example" {
  cidr_block = var.use_ipam == false && var.cidr_block != "" ? var.cidr_block : null
}

variable "use_ipam" {
  type = bool
}

variable "cidr_block" {
  type = string
}