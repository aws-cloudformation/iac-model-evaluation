# Terraform code to create AWS VPC Endpoint with gateway load balancer via the 'awscc' provider

# Fetch current AWS caller identity from AWS STS
data "aws_caller_identity" "current" {}

# Create VPC
resource "awscc_ec2_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Create Subnet
resource "awscc_ec2_subnet" "main" {
  vpc_id            = awscc_ec2_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-west-1c"
}

# Create Internet Gateway
resource "aws_internet_gateway" "ig" {
  vpc_id = awscc_ec2_vpc.main.id
}

# Create Gateway Load Balancer
resource "aws_lb" "test" {
  name               = "test-lb-tf"
  load_balancer_type = "gateway"
  subnets            = [awscc_ec2_subnet.main.id]
}

# Create VPC Endpoint Service for Gateway Load Balancer
resource "aws_vpc_endpoint_service" "example" {
  acceptance_required        = false
  gateway_load_balancer_arns = [aws_lb.test.arn]
}

# Create VPC Endpoint for Gateway Load Balancer
resource "awscc_ec2_vpc_endpoint" "example" {
  service_name      = aws_vpc_endpoint_service.example.service_name
  vpc_endpoint_type = aws_vpc_endpoint_service.example.service_type
  vpc_id            = awscc_ec2_vpc.main.id
}
