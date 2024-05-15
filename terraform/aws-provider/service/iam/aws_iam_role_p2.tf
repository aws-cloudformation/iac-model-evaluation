# Terraform code to create an IAM Role via the 'aws' provider

# Define IAM Role
resource "aws_iam_role" "example" {
  # Define a name for your IAM Role
  name = "example"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "" # Enter your service endpoint. Ex: ec2.amazonaws.com
        }
      },
    ]
  })
  # Add desired tags
  tags = {
    tag-key = "tag-value"
  }
}

# Define IAM Policy
resource "aws_iam_policy" "example" {
  # Define a name for your IAM Policy
  name = "example"
  path = "/"
  # Add a description for your policy
  description = "example"

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
  role       = "YourIAMRoleName" # Your IAM Role. Ex. aws_iam_role.example.name or "YourIAMRoleName"
  policy_arn = "YourPolicyARN"   # Your IAM Policy ARN. Ex. aws_iam_policy.policy.arn or "YourPolicyARN"
}
