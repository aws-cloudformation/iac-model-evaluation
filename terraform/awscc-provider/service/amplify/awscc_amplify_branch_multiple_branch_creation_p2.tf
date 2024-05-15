# Terraform code to create 2 AWS Amplify Branches named 'main' and 'dev' via the 'awscc' provider

#  Create AWS Amplify App
resource "awscc_amplify_app" "example" {
  name = "app"
}

# Create AWS Amplify Branch named 'main' within the above AWS Amplify App
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

# Create AWS Amplify Branch named 'dev' within the above AWS Amplify App
resource "awscc_amplify_branch" "dev" {
  app_id      = awscc_amplify_app.example.app_id
  branch_name = "dev"

  framework = "React"
  stage     = "DEVELOPMENT"

  environment_variables = [
    {
      name  = "REACT_APP_API_SERVER"
      value = "https://dev.api.example.com"
    },
    {
      name  = "Environment"
      value = "DEV"
    },
  ]
}
