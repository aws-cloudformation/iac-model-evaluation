import * as cdk from 'aws-cdk-lib';
import * as iotanalytics from 'aws-cdk-lib/aws-iotanalytics';
import { Construct } from 'constructs';

export class IotAnalyticsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Create an AWS IoT Analytics channel using CDK
    const cfnChannel = new iotanalytics.CfnChannel(this, 'MyCfnChannel', {
      channelName: 'MyCDKChannel',
      retentionPeriod: {
        numberOfDays: 10,
        unlimited: false
      }
    });
    
    // Create IOT Analytics Datastore using CDK
    const cfnDatastore = new iotanalytics.CfnDatastore(this, 'MyCfnDatastore', {
      datastoreName: 'CDKDatastore',
      retentionPeriod: {
        numberOfDays: 10,
        unlimited: false
      }
    });

    // Create IOT Analytics Dataset using CDK
    const cfnDataset = new iotanalytics.CfnDataset(this, 'MyCfnDataset', {
      datasetName: 'CDKDataset',
      triggers: [{
        schedule: {
          scheduleExpression: 'cron(0 12 * * ? *)'
        }
      }],
      actions: [{
        actionName: 'CDKAction',
        queryAction: {
          sqlQuery: 'select * from CDKDatastore'
        }
      }]
    });

    // Add dependency to ensure the datastore is created before the dataset and pipeline
    cfnDataset.addDependency(cfnDatastore);
    
    // Create IOT Analytics Pipeline using CDK
    new iotanalytics.CfnPipeline(this, 'MyCfnPipeline', {
      pipelineName: 'CDKPipeline',
      pipelineActivities: [{
        channel: {
          channelName: cfnChannel.channelName || 'DefaultChannelName',
          name: 'CDKChannelName',
          next: 'CDKDatastoreActivity'
        },
        datastore: {
          datastoreName: cfnDatastore.datastoreName || 'DefaultDatastoreName',
          name: 'CDKDatastoreActivity'
        }
      }]
    });
  }
}
