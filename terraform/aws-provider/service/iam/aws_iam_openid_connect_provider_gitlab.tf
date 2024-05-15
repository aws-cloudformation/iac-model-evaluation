# Create an IAM OpenID Connect (OIDC) identity provider for GitLab via the 'aws' provider

# Declare GitLab IdP URL local value
locals {
  gitlab_idp_url = "https://gitlab.com"
}

# Get GitLab IdP TLS certificate information
data "tls_certificate" "gitlab" {
  url = local.gitlab_idp_url
}

# Define GitLab IAM OpenID Connect provider
resource "aws_iam_openid_connect_provider" "gitlab" {
  url             = local.gitlab_idp_url
  client_id_list  = ["https://gitlab.com"]
  thumbprint_list = [data.tls_certificate.gitlab.certificates[0].sha1_fingerprint]
}
