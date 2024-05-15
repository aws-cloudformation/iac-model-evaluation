# Write Terraform configuration that creates AWS VPC route table, use awscc provider

# Create VPC
resource "awscc_ec2_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}

# Create VPC Route Table
resource "awscc_ec2_route_table" "custom_route_table" {
  vpc_id = awscc_ec2_vpc.vpc.id
  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}

