# create IAM role, use template file for the assume role policy , pass the account id as variable to the template file
resource "awscc_iam_role" "example" {
  assume_role_policy_document = templatefile("assume-role-policy.tpl", { account_id = var.account_id })
}

variable "account_id" {
  type = string
}