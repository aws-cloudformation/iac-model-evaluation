# Create Terraform resoource for secrets manager secret, set the secret value from variable secret_string if available, else auto-generate the secret

resource "aws_secretsmanager_secret" "example" {
  name = "my_secret"
}

resource "aws_secretsmanager_secret_version" "example" {
  secret_id     = aws_secretsmanager_secret.example.id
  secret_string = var.generate_secret ? random_password.example.result : var.secret_string
}

resource "random_password" "example" {
  length  = 16
  special = true
}

variable "secret_string" {
  type      = string
  sensitive = true
}

variable "generate_secret" {
  type    = bool
  default = false
}