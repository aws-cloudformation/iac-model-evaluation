# Terraform code to create Fargate profile via the 'awscc' provider

# Create a Fargate profile named 'example' for defined namespace pods
resource "awscc_eks_fargate_profile" "example" {
  cluster_name           = awscc_eks_cluster.example.name
  fargate_profile_name   = "example"
  pod_execution_role_arn = awscc_iam_role.example.arn
  subnets                = [awscc_ec2_subnet.example1.id, awscc_ec2_subnet.example2.id]

  selectors = [{
    namespace = "default"
  }]
  tags = [
    {
      key   = "Managed By"
      value = "AWSCC"
    }
  ]
}

# Create a Fargate profile named 'example' for defined namespace and labeled pods
resource "awscc_eks_fargate_profile" "example" {
  cluster_name           = awscc_eks_cluster.example.name
  fargate_profile_name   = "example"
  pod_execution_role_arn = awscc_iam_role.example.arn
  subnets                = [awscc_ec2_subnet.example1.id, awscc_ec2_subnet.example2.id]

  selectors = [{
    namespace = "default"
    labels = [{
      key   = "env"
      value = "dev"
    }]
  }]
  tags = [
    {
      key   = "Managed By"
      value = "AWSCC"
    }
  ]
}

# Create an EKS Pod execution role for EKS Fargate Profile
resource "awscc_iam_role" "example" {
  role_name   = "example-AmazonEKSFargatePodExecutionRole"
  description = "Example AWS FargatePod execution role"
  assume_role_policy_document = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks-fargate-pods.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
  managed_policy_arns = ["arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"]
  tags = [
    {
      key   = "Managed By"
      value = "AWSCC"
    }
  ]
}
