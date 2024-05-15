# Create a RDS MySQL database via the 'awscc' provider

# Create default tennacy VPC with DNS hostname and resolution support using RFC 1918 /24 subnet mask
resource "awscc_ec2_vpc" "vpc" {
  cidr_block           = "10.0.0.0/16"
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true

}

# Create Public subnet in the first /27 subnet mask of the VPC CIDR
resource "awscc_ec2_subnet" "subnet_1" {
  vpc_id                  = resource.awscc_ec2_vpc.vpc.id
  cidr_block              = cidrsubnet(awscc_ec2_vpc.vpc.cidr_block, 3, 0)
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

}

# Create Public subnet in the second /27 subnet mask of the VPC CIDR
resource "awscc_ec2_subnet" "subnet_2" {
  vpc_id                  = resource.awscc_ec2_vpc.vpc.id
  cidr_block              = cidrsubnet(awscc_ec2_vpc.vpc.cidr_block, 3, 1)
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1b"

}

# Create username secret and store it in AWS Secrets Manager
resource "awscc_secretsmanager_secret" "username" {
  name        = "admin"
  description = "DB username"
}

# Custom KMS Key
resource "aws_kms_key" "kms_key" {
  description = "Example KMS Key"
}

# RDS Subnet Group with spread out accross VPC Subnet Groups
resource "awscc_rds_db_subnet_group" "rds_group" {
  db_subnet_group_name        = "example"
  db_subnet_group_description = "example subnet group"
  subnet_ids                  = [awscc_ec2_subnet.subnet_1.id, awscc_ec2_subnet.subnet_2.id]
}

# Create RDS MySQL Database with the kms_key_id attribute under nested block master_user_secret to specify a specific KMS Key.
# master_user_secret contains the secret managed by RDS in AWS Secrets Manager for the master user password
resource "awscc_rds_db_instance" "mysql_instance" {
  allocated_storage           = 10
  db_name                     = "mydb"
  engine                      = "mysql"
  engine_version              = "5.7"
  db_instance_class           = "db.t3.micro"
  manage_master_user_password = true
  master_username             = "foo"
  master_user_secret = {
    kms_key_id = aws_kms_key.kms_key.key_id
  }
  db_parameter_group_name = "default.mysql5.7"
  db_subnet_group_name    = awscc_rds_db_subnet_group.rds_group.id

}
