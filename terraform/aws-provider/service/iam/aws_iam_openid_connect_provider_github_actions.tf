# Create an IAM OpenID Connect (OIDC) identity provider for GitHub Actions via the 'aws' provider

# Declare GitHub Actions IdP URL local value
locals {
  github_actions_idp_url = "https://token.actions.githubusercontent.com"
}

# Get GitHub Actions IdP TLS certificate information
data "tls_certificate" "github_actions" {
  url = local.github_actions_idp_url
}

# Define GitHub Actions IAM OpenID Connect provider
resource "aws_iam_openid_connect_provider" "github_actions" {
  url             = local.github_actions_idp_url
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github_actions.certificates[0].sha1_fingerprint]
}
