# Create an IAM Role for GitLab with OIDC via the 'aws' provider

# Declare GitLab values
locals {
  gitlab_fqdn    = "gitlab.com" # The address of your GitLab instance, such as gitlab.com or gitlab.example.com.
  gitlab_group   = "example-group"
  gitlab_project = "example-project"
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
          "Federated" : "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${local.gitlab_fqdn}"
        },
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Condition" : {
          "StringEquals" : {
            "${local.gitlab_fqdn}:sub" : "project_path:${local.gitlab_group}/${local.gitlab_project}:ref_type:branch:ref:main"
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
  description = "Example role for GitLab with OIDC"

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
