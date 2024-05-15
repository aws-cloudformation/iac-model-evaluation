# Terraform code to create CloudWatch Logs resource policy for elasticsearch via the 'awscc' provider

# Create IAM Policy Document
data "aws_iam_policy_document" "elasticsearch-log-publishing-policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:PutLogEventsBatch",
    ]

    resources = ["arn:aws:logs:*"]

    principals {
      identifiers = ["es.amazonaws.com"] // change this to service endpoint for desired resource (e.g. s3.amazonaws.com)
      type        = "Service"
    }
  }
}

# Create CloudWatch Logs resource policy
resource "awscc_logs_resource_policy" "this" {
  policy_document = data.aws_iam_policy_document.elasticsearch-log-publishing-policy.json
  policy_name     = "elasticsearch-log-publishing-policy"
}
