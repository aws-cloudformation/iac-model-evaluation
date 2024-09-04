import aws_cdk as core
import aws_cdk.assertions as assertions
from image_builder.image_builder_stack import ImageBuilderStack


def test_image_builder_stack_created():
    app = core.App()
    stack = ImageBuilderStack(app, "image-builder")
    assertions.Template.from_stack(stack)