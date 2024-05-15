# Create AWS VPC Interface Endpoint via the 'awscc' provider

# Create VPC
resource "awscc_ec2_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

# Create Security Group
resource "aws_security_group" "sg1" {
  name        = "allow_tls"
  description = "Allow TLS inbound traffic"
  vpc_id      = awscc_ec2_vpc.main.id

  ingress {
    description = "TLS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [awscc_ec2_vpc.main.cidr_block]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "allow_tls"
  }
}

# Create Interface VPC Endpoint
resource "awscc_ec2_vpc_endpoint" "ec2" {
  vpc_id            = awscc_ec2_vpc.main.id
  service_name      = "com.amazonaws.us-west-2.ec2"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.sg1.id,
  ]

  private_dns_enabled = true
}

