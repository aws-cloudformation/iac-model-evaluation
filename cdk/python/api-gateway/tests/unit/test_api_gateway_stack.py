import aws_cdk as core
import aws_cdk.assertions as assertions

from api_gateway.api_gateway_stack import ServerlessStack

def test_api_gateway():
    app = core.App()
    stack = ServerlessStack(app, "ServerlessStack")
    template = assertions.Template.from_stack(stack)
    
    #Trying to find child will return None if it doesn't exist and the test will fail  
    api_gateway = stack.node.try_find_child("myapi") 
