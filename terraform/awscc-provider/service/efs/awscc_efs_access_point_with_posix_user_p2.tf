# Terraform code to create EFS access point with posix user via the 'awscc' provider

# Create EFS Access Point
resource "awscc_efs_access_point" "this" {
  file_system_id = awscc_efs_file_system.this.id
  # Define Posix User
  posix_user = {
    gid = 1001
    uid = 1001
  }

  access_point_tags = [
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

# Create EFS File System
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
