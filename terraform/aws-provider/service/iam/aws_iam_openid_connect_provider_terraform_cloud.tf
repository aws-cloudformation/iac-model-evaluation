# Create an IAM OpenID Connect (OIDC) identity provider for Terraform Cloud via the 'aws' provider

# Declare Terraform Cloud IdP URL local value
locals {
  terraform_cloud_idp_url = "https://app.terraform.io"
}

# Get Terraform Cloud IdP TLS certificate information
data "tls_certificate" "terraform_cloud" {
  url = local.terraform_cloud_idp_url
}

# Define Terraform Cloud IAM OpenID Connect provider
resource "aws_iam_openid_connect_provider" "terraform_cloud" {
  url             = local.terraform_cloud_idp_url
  client_id_list  = ["aws.workload.identity"]
  thumbprint_list = [data.tls_certificate.terraform_cloud.certificates[0].sha1_fingerprint]
}
