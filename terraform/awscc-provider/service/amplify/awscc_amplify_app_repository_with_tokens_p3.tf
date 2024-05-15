# Write Terraform configuration that create AWS Amplify App with repository that uses tokens, use awscc provider

resource "awscc_amplify_app" "example" {
  name       = "app"
  repository = "https://github.com/example/app"

  # GitHub personal access token
  access_token = "..."

  tags = [
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
