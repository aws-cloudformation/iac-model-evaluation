# Terraform code for e2e test that creates the required resources and validates that the names of the iam role, iam policy, and s3 bucket starts with 'example-prod-resource'

# HINT: Make sure to run `terraform init` in this directory before running `terraform test`. Also, ensure you use constant values (e.g. string, number, bool, etc.) within your tests where at all possible or you may encounter errors.

# - End-to-end Tests -
run "e2e_test" {
  command = apply

  # Using global variables defined above since additional variables block is not defined here
  variables {
    aws_region = "us-east-1"
  }


  # Assertions
  # IAM Role - Ensure the role has the correct name, and trust policy after creation
  assert {
    condition     = startswith(aws_iam_role.example.id, "example-prod-resource")
    error_message = "The IAM Role name (${aws_iam_role.example.name}) did not start with the expected value (example-prod-resource)."
  }

  assert {
    condition     = jsondecode(aws_iam_role.example.assume_role_policy)["Statement"][0]["Principal"]["Service"] == "ec2.amazonaws.com"
    error_message = "The IAM role trust policy (${aws_iam_role.example.assume_role_policy}) did not trust the expected service principal (ec2.amazonaws.com)"
  }


  # S3 - Ensure S3 Bucket have correct names after creation
  assert {
    condition     = startswith(aws_s3_bucket.example.id, "example-prod-resource")
    error_message = "The S3 Remote State Bucket name (${aws_s3_bucket.example.id}) did not start with the expected value (example-prod-resource)."
  }
}


