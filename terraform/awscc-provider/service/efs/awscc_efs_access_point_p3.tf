# Write Terraform configuration that creates EFS access point, use awscc provider

# Create EFS Access Point
resource "awscc_efs_access_point" "this" {
  file_system_id = awscc_efs_file_system.this.id

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
