# Terraform code to create an EC2 route with a Public NAT gateway via the 'aws' provider

resource "aws_route" "example" {
    route_table_id = aws_route_table.example.id
    destination_cidr_block = "100.0.0.0/16"
    nat_gateway_id = aws_nat_gateway.example.id

    depends_on = [aws_nat_gateway.example]
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

# Create a EIP association
resource "aws_eip" "example" {
    domain = "vpc"
}

# Create a EC2 instance
resource "aws_instance" "example" {
    instance_type = "t2.micro"

    # Replace with your desired ami id
    ami = "ami-xxxxxxxxxxxx"
}

# Create a Internet Gateway
resource "aws_internet_gateway" "example" {
    vpc_id = aws_vpc.example.id
    
    depends_on = [aws_vpc.example]
}

# Create a Public NAT gateway
resource "aws_nat_gateway" "example" {
    subnet_id = aws_subnet.example.id
    allocation_id = aws_eip.example.allocation_id
    
    depends_on = [aws_internet_gateway.example]
}
