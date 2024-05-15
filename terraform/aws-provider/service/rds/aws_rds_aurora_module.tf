# Write Terraform configuration that creates RDS aurora postgres, use module

module "database" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "~> 8.0"

  name           = "example"
  engine         = "aurora-postgresql"
  engine_version = "14.5"
  instance_class = "db.t3.medium"
  master_username = "root"

  vpc_security_group_ids = ["sg-feb876b3"]
  db_subnet_group_name = "default"
}