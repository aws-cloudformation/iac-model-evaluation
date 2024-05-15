# create aws secrets manager secret with secret string value from variable called my_secret, mark the variable as sensitive
resource "awscc_secretsmanager_secret" "example" {
  name = "example"
  secret_string = var.my_secret
}

variable "my_secret" {
  type    = string
  sensitive = true
}