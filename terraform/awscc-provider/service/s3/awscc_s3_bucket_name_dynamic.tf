# aws_iam_policy_document for bucket policy, use dynamic block to iterate over list of iam role names. For each statement, set the action to Getobject, set resource to bucket prefix + role name, set AWS principal role ARN with combination of account id and role name 

resource "awscc_s3_bucket" "example" {
}

resource "awscc_s3_bucket_policy" "example" {
  bucket          = awscc_s3_bucket.example.id
  policy_document = data.aws_iam_policy_document.example.json
}

data "aws_iam_policy_document" "example" {
  dynamic "statement" {
    for_each = var.iam_role_names
    content {
      sid       = statement.key
      actions   = ["s3:GetObject"]
      resources = ["${awscc_s3_bucket.example.arn}/${statement.value}/*"]
      principals {
        type        = "AWS"
        identifiers = ["arn:aws:iam::${var.account_id}:role/${statement.value}"]
      }
    }
  }
}

variable "iam_role_names" {
  type = list(any)
  default = [
    "my-role-1",
    "my-role-2"
  ]
}

variable "account_id" {
  type = string
}