# for each policy in var managed_policy_arns, create aws_iam_policy_attachment resource with policy_arn set to the item in the list
resource "aws_iam_role_policy_attachment" "example" {
  for_each   = toset(var.managed_policy_arns)
  role       = aws_iam_role.example.name
  policy_arn = each.value
}

variable "managed_policy_arns" {
  type = list(any)
  default = [
    "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
  ]
}

resource "aws_iam_role" "example" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}