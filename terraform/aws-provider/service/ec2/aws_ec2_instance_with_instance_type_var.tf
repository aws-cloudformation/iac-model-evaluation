# Write Terraform configuration that creates Amazon Linux EC2 instances, use variable to pass the instance type

resource "aws_instance" "this" {
  ami           = data.aws_ami.amazon-linux-2.id
  instance_type = var.instance_type
  root_block_device {
    encrypted = true
  }
}

# Declare the variable for instance type
variable "instance_type" {
  type        = string
  description = "ec2 instance type"
  default     = "t2.micro"
}

# (Recommended) use data source to look up the most up to date Amazon Linux 2 AMI
data "aws_ami" "amazon-linux-2" {
  most_recent = true

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }
}