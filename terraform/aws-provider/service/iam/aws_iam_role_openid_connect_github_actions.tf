# Create an IAM Role for GitHub Actions with OIDC via the 'aws' provider

# Declare GitHub values
locals {
  github_actions_fqdn = "token.actions.githubusercontent.com"
  github_org          = "example-org"
  github_repo         = "example-repo"
}

# Get AWS Account information
data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

# Define IAM Role that will execute terraform runs
resource "aws_iam_role" "example" {
  # Define a name for your IAM Role
  name = "example"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Federated" : "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${local.github_actions_fqdn}"
        },
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Condition" : {
          "StringEquals" : {
            "${local.github_actions_fqdn}:sub" : "repo:${local.github_org}/${local.github_repo}:main"
            "${local.github_actions_fqdn}:aud" : "sts.amazonaws.com"
          }
        }
      },
    ]
  })
  # Add desired tags
  tags = {
    tag-key = "tag-value"
  }
}

# Define IAM Policy that will be used by the terraform role
resource "aws_iam_policy" "example" {
  # Define a name for your IAM Policy
  name = "example"
  path = "/"
  # Add a description for your policy
  description = "Example role for GitHub Actions with OIDC"

  # Define your IAM Policy
  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "", # Add your desired actions
        ]
        Effect   = "Allow"
        Resource = "" # Add your desired resource(s)
      },
    ]
  })
}

# Define IAM Role Policy Attachment
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.example.arn
}
