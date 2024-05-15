# Write Terraform configuration that creates AWS ECS Cluster, use awscc provider

resource "awscc_ecs_cluster" "this" {
  cluster_name = "example_cluster"
  cluster_settings = [{
    name  = "containerInsights"
    value = "enabled"
  }]

  tags = [{
    key   = "Modified By"
    value = "AWSCC"
  }]
}
