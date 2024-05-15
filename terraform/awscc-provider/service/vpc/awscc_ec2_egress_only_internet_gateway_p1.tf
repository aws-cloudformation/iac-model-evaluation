# Create egress only internet gateway via the 'awscc' provider

# Create VPC
resource "awscc_ec2_vpc" "example" {
  cidr_block = "10.1.0.0/16"
}

# Create Egress Only IGW
resource "awscc_ec2_egress_only_internet_gateway" "example" {
  vpc_id = awscc_ec2_vpc.example.id
}
