# Terraform code to create spread ec2 placement group via the 'awscc' provider

resource "awscc_ec2_placement_group" "web" {
  strategy     = "spread"
  spread_level = "host"
  tags = [
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
