# create elastic ip according to count of the var instance_count, create output called public_ip_list with value of all elastic ip
resource "aws_eip" "example" {
  count = var.instance_count
}

output "public_ip_list" {
  value = aws_eip.example.*.public_ip
}

variable "instance_count" {
  type = number
}
