# create ec2 instance, use function startswith to check if var environment is prod and set instance type to t2.xlarge if true, otherwise set to t2.micro
resource "aws_instance" "example" {
  ami           = data.aws_ami.amazon-linux-2.id
  instance_type = startswith(var.environment, "prod") ? "t2.large" : "t2.micro"
}

variable "environment" {
  type = string
}

# use data source to look up the most up to date Amazon Linux 2 AMI
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