import aws_cdk as core
import aws_cdk.assertions as assertions

from elasticache_resources.elasticache_resources_stack import ElasticacheResourcesStack

# example tests. To run these tests, uncomment this file along with the example
# resource in elasticache_resources/elasticache_resources_stack.py
def test_elasticache_stack_created():
    app = core.App()
    stack = ElasticacheResourcesStack(app, "elasticache-resources")
    template = assertions.Template.from_stack(stack)


