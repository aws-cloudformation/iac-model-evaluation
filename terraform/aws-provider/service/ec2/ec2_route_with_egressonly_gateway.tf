# Terraform code to create an ec2 route with a VPC Egress only Internet Gateway via the 'aws' provider

resource "aws_route" "example" {
    route_table_id = aws_route_table.example.id
    destination_ipv6_cidr_block = "2002:0:0:1234::/64"
    egress_only_gateway_id = aws_egress_only_internet_gateway.example.id

    depends_on = [aws_egress_only_internet_gateway.example]
}

# Create an VPC
resource "aws_vpc" "example" {
    cidr_block = "10.0.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true 
    tags = {
        Name = "MainVPC"
    }
}

# Create a Route Table
resource "aws_route_table" "example" {
    vpc_id = aws_vpc.example.id
    tags = {
        Name = "PublicRouteTable"
    }
}

# Create a egress only internet gateway
resource "aws_egress_only_internet_gateway" "example" {
  vpc_id = aws_vpc.example.id
}