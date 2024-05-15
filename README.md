# **CodeWhisperer Infrastructure as Code Evaluation**

This repository contains high quality samples of IaC code that can be used to validate trained models.


## **Customer Impact**

CodeWhisperer customers rely on the recommendations it provides to improve developer productivity, while also depending on us to generate code that is secure by default. Customers who adopt Infrastructure as Code should also be able to benefit from these recommendations with writing CloudFormation (YAML and JSON), CDK (all supported languages) and Terraform HCL.

## **Goals**

* Launch IaC support for IaC in CodeWhisperer before re:Invent
* High quality, secure recommendations for CloudFormation, CDK (all languages), and Terraform HCL

## **Team**

- **[Eric Beard](https://phonetool.amazon.com/users/ezbeard)** - Project lead

- **[Michael Maeng](https://phonetool.amazon.com/users/mmaeng)** - CDK

- **[Casey Lee](https://phonetool.amazon.com/users/caseypl)** - CDK

- **[Kevin DeJong](https://phonetool.amazon.com/users/kddejong)** - CloudFormation

- **[Kevon Mayers](https://phonetool.amazon.com/users/novekm)** - Terraform

## **Contributing - Getting Started** 🚀

### **Familiarize yourself with repo**

Get familiar with the repo. The goal is to have examples for CDK, CFN, and TF for all languages where applicable (e.g. JSON/YAML for CFN, all languages for CDK) so if a resource is already created but is in written in a different language, feel free to add support for a different one. Similar applies for Terraform. We need examples for both the aws and awscc providers.


### **Check for existing issues**

Check open issues in GitLab to ensure someone isn’t already working on the same resource for your desired IaC tool. If no issue for your desired resource/IaC tool already exists, create a new one for tracking. We will be starting with basic service implementations like (S3, Lambda, EC2, API Gateway, etc.) and will make modifications to structure if needed based on feedback from the CodeWhisperer team. Main thing is to ensure there are good inline comments and that the example is of high quality and secure. See the files in the repo for examples.

### **Start coding**

At this point, you may begin working on the code. Ensure code is functional and passing security tests before submitting a merge request.

*Important:* Make sure every code block has a comment above it! These comments need to be what you would expect a developer to type in as a prompt to CodeWhisperer. The CW data team will delete the code blocks and leave the comment to see if CW can reproduce the code correctly.


### **Commit**

Stage and comment your commit, we suggest you use the following commit message format

`add example for: [resource name]`

### **Submitting Merge Request**

Once you are finished with your resource and code is passing functional/security tests, you may submit a merge request. **Please use the following format:**

`examples - [IaC tool] - [resource name] - [programming language or tf provider]`



### **Questions, comments, concerns**

Slack Channel: TBD




