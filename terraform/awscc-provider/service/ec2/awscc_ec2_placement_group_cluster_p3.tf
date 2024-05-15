# Write Terraform configuration that creates cluster ec2 placement group, use awscc provider

resource "awscc_ec2_placement_group" "web" {
  strategy = "cluster"
  tags = [
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
