# Write Terraform configuration that creates AWS ECR Repository with scan on push, use awscc provider

resource "awscc_ecr_repository" "this" {
  repository_name      = "example-ecr"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration = {
    scan_on_push = true
  }

}
