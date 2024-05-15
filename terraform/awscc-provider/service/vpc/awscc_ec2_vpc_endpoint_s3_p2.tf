# Terraform code to create AWS VPC Endpoint for S3 via the 'awscc' provider

# Create VPC
resource "awscc_ec2_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Create VPC Endpoint for S3
resource "awscc_ec2_vpc_endpoint" "s3" {
  vpc_id       = awscc_ec2_vpc.main.id
  service_name = "com.amazonaws.us-west-2.s3" // replace us-west-2 with your desired region
}
