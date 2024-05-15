# Create a VPC with a Route53 Resolver via the 'aws' provider

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

locals {
  r53_inbound_ports = [
    {
      from_port   = 53
      to_port     = 53
      description = "DNS"
      protocol    = "TCP"
      cidr_blocks = [aws_vpc.main.cidr_block]
    },
    {
      from_port   = 53
      to_port     = 53
      description = "DNS"
      protocol    = "UDP"
      cidr_blocks = [aws_vpc.main.cidr_block]
    }
  ]
}

locals {
  r53_outbound_ports = [
    {
      from_port   = 53
      to_port     = 53
      description = "DNS"
      protocol    = "TCP"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 53
      to_port     = 53
      description = "DNS"
      protocol    = "UDP"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

# Create Security Group allowing TCP and UDP ports inbound and outbound. Outbound is allow to all IP space and inbound is restricted  to the VPC CIDR.
resource "aws_security_group" "sg" {
  name        = "R53-Security-Group"
  description = "R53-Security-Group"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = local.r53_inbound_ports
    iterator = ports
    content {
      description = ports.value.description
      from_port   = ports.value.from_port
      to_port     = ports.value.to_port
      protocol    = ports.value.protocol
      cidr_blocks = ports.value.cidr_blocks
    }
  }

  dynamic "egress" {
    for_each = local.r53_outbound_ports
    iterator = ports
    content {
      description = ports.value.description
      from_port   = ports.value.from_port
      to_port     = ports.value.to_port
      protocol    = ports.value.protocol
      cidr_blocks = ports.value.cidr_blocks
    }
  }
}

# Create R53 Outbound Resolver with auto-assigned IPs.
resource "aws_route53_resolver_endpoint" "r53_outbound_resolver" {
  name               = "R53-Outbound-Resolver"
  direction          = "OUTBOUND"
  security_group_ids = [aws_security_group.sg.id]
  ip_address {
    subnet_id = aws_subnet.private_subnet1.id
  }
  ip_address {
    subnet_id = aws_subnet.private_subnet2.id
  }
}

# Create R53 Inbound Resolver with auto-assigned IPs.
resource "aws_route53_resolver_endpoint" "r53_inbound_resolver" {
  name               = "R53-Inbound-Resolver"
  direction          = "INBOUND"
  security_group_ids = [aws_security_group.sg.id]
  ip_address {
    subnet_id = aws_subnet.private_subnet1.id
  }
  ip_address {
    subnet_id = aws_subnet.private_subnet2.id
  }
}

# Create R53 Forward rule for aws.amazon.com targeting 10.0.0.10 associated with R53RInbound
resource "aws_route53_resolver_rule" "r53_outbound_resolver_rule" {
  domain_name          = "aws.amazon.com"
  name                 = "R53-Rule-Test"
  rule_type            = "FORWARD"
  resolver_endpoint_id = aws_route53_resolver_endpoint.r53_outbound_resolver.id
  target_ip {
    ip = "10.0.0.10"
  }
}

# Associate the R53 Rule with the VPC
resource "aws_route53_resolver_rule_association" "r53_outbound_resolver_rule_association" {
  resolver_rule_id = aws_route53_resolver_rule.r53_outbound_resolver_rule.id
  vpc_id           = aws_vpc.main.id
}
