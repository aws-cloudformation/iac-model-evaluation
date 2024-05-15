# Create AWS VPC route table with subnet associations via the 'awscc' provider

# Create VPC
resource "awscc_ec2_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}

# Create Route Table
resource "awscc_ec2_route_table" "custom_route_table" {
  vpc_id = awscc_ec2_vpc.vpc.id
  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}

# Create Subnet
resource "awscc_ec2_subnet" "subnet1" {
  vpc_id = awscc_ec2_vpc.vpc.id

  cidr_block        = "10.0.101.0/24"
  availability_zone = "us-east-1a"

  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}

# Create Subnet Associations
resource "awscc_ec2_subnet_route_table_association" "subnet_route_table_association" {
  route_table_id = awscc_ec2_route_table.custom_route_table.id
  subnet_id      = awscc_ec2_subnet.subnet1.id
}
