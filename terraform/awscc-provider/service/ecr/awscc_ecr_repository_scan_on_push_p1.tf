# Create AWS ECR Repository with scan on push via the 'awscc' provider

resource "awscc_ecr_repository" "this" {
  repository_name      = "example-ecr"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration = {
    scan_on_push = true
  }

}
