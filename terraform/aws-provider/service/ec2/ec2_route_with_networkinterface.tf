# Terraform code to create an ec2 route with a network interface via the 'aws' provider

resource "aws_route" "example" {
    route_table_id = aws_route_table.example.id
    destination_cidr_block = "100.0.0.0/16"
    network_interface_id = aws_network_interface.example.id

    depends_on = [aws_network_interface.example, aws_route_table.example]
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

# Creata a Route Table
resource "aws_route_table" "example" {
    vpc_id = aws_vpc.example.id
    tags = {
        Name = "PublicRouteTable"
    }
}

# Create a Network Interface 
resource "aws_network_interface" "example" {
  subnet_id = aws_subnet.example.id
  description  = "Network interface example"

}
