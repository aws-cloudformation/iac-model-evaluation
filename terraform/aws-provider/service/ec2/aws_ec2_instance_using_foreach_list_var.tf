# create variable type list of string called instance_name with default value of empty list
variable "instance_name" {
  type = list(string)
  default = []
}

# create multiple ec2 instance according to the number of item on var instance_name, set the instance name according to the var instance_name
resource "aws_instance" "example" {
  for_each      = toset(var.instance_name)
  ami           = data.aws_ami.amazon-linux-2.id
  instance_type = "t2.micro"
  tags = {
    Name = each.value
  }
}

# data source aws_ami to search for the latest Amazon linux 
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