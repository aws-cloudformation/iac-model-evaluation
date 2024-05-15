# Write Terraform configuration that creates public AWS ECR Repository, use awscc provider

resource "awscc_ecr_public_repository" "example" {
  repository_name = "example"
  tags = [{
    key   = "Managed By"
    value = "AWSCC"
  }]
}
