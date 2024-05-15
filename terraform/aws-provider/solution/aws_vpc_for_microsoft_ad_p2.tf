# Terraform code to create a VPC for Microsoft AD via the 'aws' provider

# Get availability zones to for subnet deployments
data "aws_availability_zones" "available" {
  state = "available"
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

# Create default tennacy VPC with DNS hostname and resolution support using RFC 1918 /24 subnet mask
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/24"
  enable_dns_hostnames = true
  enable_dns_support   = true
  instance_tenancy     = "default"
}

# Create Private subnet in 1st available AZ with the first /27 subnet mask of the VPC CIDR
resource "aws_subnet" "private_subnet1" {
  availability_zone       = data.aws_availability_zones.available.names[0]
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 3, 0)
  map_public_ip_on_launch = false
  vpc_id                  = aws_vpc.main.id
}

# Create Private subnet in 2nd available AZ with the second /27 subnet mask of the VPC CIDR
resource "aws_subnet" "private_subnet2" {
  availability_zone       = data.aws_availability_zones.available.names[1]
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 3, 1)
  map_public_ip_on_launch = false
  vpc_id                  = aws_vpc.main.id
}

# Create AWS Managed Microsoft AD Enterpise Edition with a domain name of corp.example.com and NETBios name of CORP
resource "aws_directory_service_directory" "main" {
  desired_number_of_domain_controllers = 2
  edition                              = "Enterprise"
  enable_sso                           = false
  name                                 = "corp.example.com"
  password                             = "P@ssw0rd"
  short_name                           = "CORP"
  type                                 = "MicrosoftAD"
  vpc_settings {
    vpc_id     = aws_vpc.main.id
    subnet_ids = [aws_subnet.private_subnet1.id, aws_subnet.private_subnet2.id]
  }
}
