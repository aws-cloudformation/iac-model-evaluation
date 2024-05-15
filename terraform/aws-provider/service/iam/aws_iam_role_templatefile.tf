# create an IAM role, use template file for the assume role policy, pass the account_id as variable to the template file
resource "aws_iam_role" "example" {
  name               = "example"
  assume_role_policy = templatefile("assume-role-policy.tpl", { account_id = var.account_id })
}

variable "account_id" {
  type = string
}