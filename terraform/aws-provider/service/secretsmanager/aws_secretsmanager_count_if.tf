# Write Terraform configuration that creates Secrets Manager and set the secret version if var generate_secret is true

resource "aws_secretsmanager_secret" "example" {
  name = "my_secret"
}

resource "aws_secretsmanager_secret_version" "example" {
  count = var.generate_secret ? 1 : 0

  secret_id     = aws_secretsmanager_secret.example.id
  secret_string = random_password.example.result
}

resource "random_password" "example" {
  length  = 16
  special = true
}

variable "generate_secret" {
  type    = bool
  default = false
}