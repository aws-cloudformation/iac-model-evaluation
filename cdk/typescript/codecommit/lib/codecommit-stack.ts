import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import { CfnOutput } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';



export class CodecommitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Create Code Commit Repository Trigger 
    //and Specific CloudWatch Event Rules for CodeCommit
    // BranchCreatedRule, BranchDeletedRule, PullRequestCreatedRule, PullRequestMergedRule
    // branchCreatedtedRule, branchDeletedRule,SourcereferenceUpdated

    // My email
    const myEmail: string = 'pjmart@amazon.com';

    // Create the CodeCommit repository
    const repo = new codecommit.Repository(this, 'MyRepository', {
      repositoryName: 'MySourceCodeRepository',
      description: 'My Source Code Repository',
    });

    // Create an SNS topic an subsbe your email to it
    const topic = new sns.Topic(this, 'MySnsTopic', {
      displayName: 'CodeCommit CloudWatch Event Notifications',
      topicName: 'MySnsTopic',
    });
    // Subscribe to the topic
    topic.addSubscription(new subs.EmailSubscription(myEmail));


    // Code Commit Trigger for all types of IAM user actions
    repo.notify(topic.topicArn);


    // Define CloudWatch Event Rule for source updated BranchCreatedRule
    const branchCreatedRule = new events.Rule(this, 'BranchCreatedRule', {
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['Branch Created'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['referenceCreated'],
        },
      },
    })
    branchCreatedRule.addTarget(new targets.SnsTopic(topic));

    // Define CloudWatch Event Rule for source updated (referenceUpdated)
    const branchDeletedRule = new events.Rule(this, 'Branch Deleted', {
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['Branch Deleted'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['referenceDeleted'],
        },
      },
    })
    branchDeletedRule.addTarget(new targets.SnsTopic(topic));

    // Define CloudWatch Event Rule for source updated SourceUpdatedRule
    const sourceUpdatedRule = new events.Rule(this, 'SourceUpdatedRule', {
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['Source Updated'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['referenceUpdated'],
        },
      },
    });
    sourceUpdatedRule.addTarget(new targets.SnsTopic(topic));

    // Define CloudWatch Event Rule for pull request created
    const pullRequestCreatedRule = new events.Rule(this, 'PullRequestCreatedRule', {
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['Pull Request Created'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['pullRequestCreated'],
        },
      },
    });
    pullRequestCreatedRule.addTarget(new targets.SnsTopic(topic));

    // Define CloudWatch Event Rule for pull request merged
    const pullRequestMergedRule = new events.Rule(this, 'PullRequestMergedRule', {
      eventPattern: {
        source: ['aws.codecommit'],
        detailType: ['Pull Request Merged'],
        resources: [repo.repositoryArn],
        detail: {
          event: ['pullRequestMerged'],
        },
      },
    });
    pullRequestMergedRule.addTarget(new targets.SnsTopic(topic));

    // Output the repository clone URL
    new CfnOutput(this, 'RepositoryCloneURL', {
      value: repo.repositoryCloneUrlHttp,
    });
  }
}
