# Create an IAM Role for Terrafrom Cloud with OIDC via the 'aws' provider

# Declare Terraform Cloud values
locals {
  terraform_cloud_fqdn      = "app.terraform.io"
  terraform_cloud_org       = "example-org"
  terraform_cloud_project   = "default"
  terraform_cloud_workspace = "example-workspace"
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
          "Federated" : "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${local.terraform_cloud_fqdn}"
        },
        "Action" : "sts:AssumeRoleWithWebIdentity",
        "Condition" : {
          "StringLike" : {
            "${local.terraform_cloud_fqdn}:sub" : "organization:${local.terraform_cloud_org}:project:${local.terraform_cloud_project}:workspace:${local.terraform_cloud_workspace}:run_phase:*"
          },
          "StringEquals" : {
            "${local.terraform_cloud_fqdn}:aud" : "aws.workload.identity"
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
  description = "Example role for Terraform Cloud with OIDC"

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
