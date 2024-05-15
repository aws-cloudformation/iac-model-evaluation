# Create AWS Amplify Branch via the 'awscc' provider

#  Create AWS Amplify App
resource "awscc_amplify_app" "example" {
  name = "app"
}

# Create AWS Amplify Branch within the above AWS Amplify App
resource "awscc_amplify_branch" "main" {
  app_id      = awscc_amplify_app.example.app_id
  branch_name = "main"

  framework = "React"
  stage     = "PRODUCTION"

  environment_variables = [
    {
      name  = "REACT_APP_API_SERVER"
      value = "https://api.example.com"
    },
    {
      name  = "Environment"
      value = "PROD"
    },
  ]
}
