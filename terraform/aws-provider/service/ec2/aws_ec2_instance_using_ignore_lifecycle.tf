# Write Terraform configuration that creates Amazon Linux EC2 instances, ignore changes to tags

resource "aws_instance" "this" {
  ami           = data.aws_ami.amazon-linux-2.id
  instance_type = "t2.micro"
  root_block_device {
    encrypted = true
  }
  lifecycle {
    ignore_changes = [
      tags,
      ]
  }
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