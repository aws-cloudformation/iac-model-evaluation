# Terraform code to create an ec2 route with VPC peering connection via the 'aws' provider

resource "aws_route" "example" {
    route_table_id = aws_route_table.example.id
    destination_cidr_block = "100.0.0.0/16"
    vpc_peering_connection_id = aws_vpc_peering_connection.example.id

    depends_on = [aws_vpc_peering_connection.example, aws_route_table.example]
}

# Creates a VPC
resource "aws_vpc" "example" {
    cidr_block = "10.0.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true 
    tags = {
        Name = "MainVPC"
    }
}

# Create a second VPC
resource "aws_vpc" "example2" {
    cidr_block = "10.10.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true 
    tags = {
        Name = "SecondVPC"
    }
}

# Create a Route Table
resource "aws_route_table" "example" {
    vpc_id = aws_vpc.example.id
    tags = {
        Name = "PublicRouteTable"
    }
}

# Create a VPC peering connection 
resource "aws_vpc_peering_connection" "example" {
    peer_vpc_id = aws_vpc.example.id
    vpc_id = aws_vpc.example2.id

    depends_on = [aws_vpc.example,aws_vpc.example2]
}
