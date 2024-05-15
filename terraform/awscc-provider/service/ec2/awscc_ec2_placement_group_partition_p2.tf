# Terraform code to create partition ec2 placement group via the 'awscc' provider

resource "awscc_ec2_placement_group" "web" {
  strategy        = "partition"
  partition_count = 2
  tags = [
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
