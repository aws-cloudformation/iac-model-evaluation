import aws_cdk as core
import aws_cdk.assertions as assertions

from database_migration_service.database_migration_service_stack import DatabaseMigrationServiceStack

# example tests. To run these tests, uncomment this file along with the example
# resource in database_migration_service/database_migration_service_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = DatabaseMigrationServiceStack(app, "database-migration-service")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
