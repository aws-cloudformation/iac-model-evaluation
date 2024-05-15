# Terraform code to create EFS File System via the 'awscc' provider

resource "awscc_efs_file_system" "this" {

  file_system_tags = [
    {
      key   = "Name"
      value = "this"
    },
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
