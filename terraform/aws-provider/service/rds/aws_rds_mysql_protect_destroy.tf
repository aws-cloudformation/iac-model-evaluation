# Write Terraform configuration that creates RDS instance with mysql engine, protect against destroy

resource "aws_db_instance" "example" {
  allocated_storage    = 20
  db_name              = "example"
  engine               = "mysql"
  engine_version       = "8.0.33"
  instance_class       = "db.t3.small"
  username             = "foo"
  password             = "foobarbaz"
  storage_encrypted    =  true
  
  lifecycle {
    prevent_destroy = true
  }
}