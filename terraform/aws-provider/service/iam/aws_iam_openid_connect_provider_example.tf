# Create an IAM OpenID Connect (OIDC) identity provider via the 'aws' provider

# Declare IdP URL local value
locals {
  example_idp_url = "https://idp.example.com" # Enter your identity provider URL. Corresponds to the iss claim.
}

# Get IdP TLS certificate information
data "tls_certificate" "example" {
  url = local.example_idp_url
}

# Define IAM OpenID Connect provider
resource "aws_iam_openid_connect_provider" "example" {
  url             = local.example_idp_url
  client_id_list  = ["apps.example.com"] # Enter your list of client IDs (also known as audiences).
  thumbprint_list = [data.tls_certificate.example.certificates[0].sha1_fingerprint]
}
