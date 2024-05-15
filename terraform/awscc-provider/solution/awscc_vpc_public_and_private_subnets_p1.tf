# Create a VPC with cidr_block '10.0.0.0/16' one public and one private subnet via the 'awscc' provider

# Create default tennacy VPC with DNS hostname and resolution support using RFC 1918 /24 subnet mask
resource "awscc_ec2_vpc" "vpc" {
  cidr_block           = "10.0.0.0/16"
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true

}

# Create an internet gateway
resource "awscc_ec2_internet_gateway" "igw" {

}

# Create custom route table in the VPC
resource "awscc_ec2_route_table" "custom_route_table" {
  vpc_id = awscc_ec2_vpc.vpc.id

}

# Create route table with all traffic that is destined outside of VPC to be routed through internet gateway
resource "awscc_ec2_route" "custom_route" {
  route_table_id         = awscc_ec2_route_table.custom_route_table.id
  gateway_id             = awscc_ec2_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"

  depends_on = [aws_internet_gateway_attachment.igw_attachment]
}

# Create Public subnet in the first /27 subnet mask of the VPC CIDR
resource "awscc_ec2_subnet" "public_subnet" {
  vpc_id                  = resource.awscc_ec2_vpc.vpc.id
  cidr_block              = cidrsubnet(awscc_ec2_vpc.vpc.cidr_block, 3, 0)
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

}

# Create Private subnet in the second /27 subnet mask of the VPC CIDR
resource "awscc_ec2_subnet" "private_subnet" {
  vpc_id                  = resource.awscc_ec2_vpc.vpc.id
  cidr_block              = cidrsubnet(awscc_ec2_vpc.vpc.cidr_block, 3, 1)
  map_public_ip_on_launch = false
  availability_zone       = "us-east-1b"

}

# Attach an internet gateway to VPC
resource "aws_internet_gateway_attachment" "igw_attachment" {
  internet_gateway_id = awscc_ec2_internet_gateway.igw.id
  vpc_id              = awscc_ec2_vpc.vpc.id
}

# Associate route table with internet gateway to the public subnet
resource "awscc_ec2_subnet_route_table_association" "subnet_route_table_association" {
  route_table_id = awscc_ec2_route_table.custom_route_table.id
  subnet_id      = awscc_ec2_subnet.public_subnet.id
}
