<!--BEGIN STABILITY BANNER-->
---

![Stability: Stable](https://img.shields.io/badge/stability-Stable-success.svg?style=for-the-badge)

> **This is a stable example. It should successfully build out of the box**
>
> This example is built on Construct Libraries marked "Stable" and does not have any infrastructure prerequisites to
> build.

---
<!--END STABILITY BANNER-->

# CloudFront Functions

This project is intended to be sample code only. Not for use in production.\

## Solution Description

This project will create a S3 bucket with simple `html` files that will serve as our website source code, a
CloudFront distribution to serve this content as our CDN and, two CloudFront functions that will work upon the request
and response.

## CDK Toolkit

The `cdk.json` file tells the CDK Toolkit how to execute your app.

To start working with the project, first you will need to install all dependencies as well as the cdk module (if not
installed already). In the project directory, run:

```bash
$ npm install -g aws-cdk
$ npm install
```

## Deploying the solution

To deploy the solution, we will need to request cdk to deploy the stack:

```shell
$ cdk deploy --all
```

> **Note** that after running the deploy command, you will be presented and Output in the console like bellow:\
> `DemoCloudfrontFunctionsStack.DistributionDomainName = xxxxxxxx.cloudfront.net`\
> We will use this URL to access and test the website.

## Destroying the deployment

To destroy the provisioned infrastructure, you can simply run the following command:

```shell
$ cdk destroy --all
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
