# create variable type map call it cluster_name, set default to map of key us-east-1, us-west-2 and us-east-2, for each key, set the value to key + prod
variable "cluster_name" {
  type = map(string)
  default = {
    us-east-1 = "us-east-1-prod"
    us-west-2 = "us-west-2-prod"
    us-east-2 = "us-east-2-prod"
  }
}

# create ecs cluster using AWS CC provider, set the cluster name attribute using lookup function, lookup the var cluster_name map with key as aws region
resource "awscc_ecs_cluster" "this" {
  cluster_name = "${lookup(var.cluster_name, data.aws_region.current.name)}"
}

# data source to get current aws region
data "aws_region" "current" {}