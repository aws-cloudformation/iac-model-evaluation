# Terraform code to create an EC2 route with internet gateway via the 'aws' provider

resource "aws_route" "example" {
    route_table_id = aws_route_table.example.id
    destination_cidr_block = "100.0.0.0/16"
    gateway_id = aws_internet_gateway.example.id

    depends_on = [aws_internet_gateway.example]
}

# Create a VPC
resource "aws_vpc" "example" {
    cidr_block = "10.0.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true 
    tags = {
        Name = "MainVPC"
    }
}

# Create a Public Subnet 
resource "aws_subnet" "example" {
    vpc_id = aws_vpc.example.id
    cidr_block = "10.0.1.0/24"
    tags = {
        Name = "PublicSubnet"
    }
    depends_on = [aws_vpc.example]
}

# Create a Route Table
resource "aws_route_table" "example" {
    vpc_id = aws_vpc.example.id
    tags = {
        Name = "PublicRouteTable"
    }
}

# Create a Internet Gateway
resource "aws_internet_gateway" "example" {
    vpc_id = aws_vpc.example.id
    
    depends_on = [aws_vpc.example]
}
