# create efs file system using variable env_type, set the availability_zone_name attribute to the first AZ if the env_type value is dev, otherwise null 
resource "aws_efs_file_system" "example" {
  availability_zone_name = var.env_type == "dev" ? element(data.aws_availability_zones.available.names, 0) : null
  encrypted              = true
  performance_mode       = "generalPurpose"
  throughput_mode        = "bursting"
}

variable "env_type" {
  type    = string
  default = "prod"
}

data "aws_availability_zones" "available" {
}