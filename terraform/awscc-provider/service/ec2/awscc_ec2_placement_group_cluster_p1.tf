# Create cluster ec2 placement group via the 'awscc' provider

resource "awscc_ec2_placement_group" "web" {
  strategy = "cluster"
  tags = [
    {
      key   = "Modified By"
      value = "AWSCC"
    }
  ]
}
