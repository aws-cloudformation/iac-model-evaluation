from aws_cdk import (

    Stack,
    aws_iotanalytics as iotanalytics
)
from constructs import Construct

class IotanalyticsStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create an AWS IoT Analytics channel using CDK
        cfn_channel = iotanalytics.CfnChannel(self, "MyCfnChannel",
            channel_name = "MyCDKChannel",
            retention_period = iotanalytics.CfnChannel.RetentionPeriodProperty(
                number_of_days = 10,
                unlimited = False
            )
        
        )

        # Create IOT Analytics Datastore using CDK
        cfn_channel.node.add_dependency(cfn_channel)
        cfn_datastore = iotanalytics.CfnDatastore(self, "MyCfnDatastore",
            datastore_name = "CDKDatastore",
            retention_period = iotanalytics.CfnDatastore.RetentionPeriodProperty(
                number_of_days = 10,
                unlimited = False
            )
        )

        # Create IOT Analytics Dataset using CDK
        cfn_dataset = iotanalytics.CfnDataset(self, "MyCfnDataset",
            dataset_name = "CDKDataset",
            triggers = [iotanalytics.CfnDataset.TriggerProperty(
                schedule=iotanalytics.CfnDataset.ScheduleProperty(
                    schedule_expression="cron(0 12 * * ? *)"
                )
            )],
            actions = [iotanalytics.CfnDataset.ActionProperty(
                action_name = "CDKAction",
                query_action = iotanalytics.CfnDataset.QueryActionProperty(
                    sql_query = "select * from CDKDatastore"
                )
            )]
        )
        # Add dependency to ensure the datastore is created before the dataset and pipeline
        cfn_dataset.node.add_dependency(cfn_datastore)

        # Create IOT Analytics Pipeline using CDK
        cfn_pipeline = iotanalytics.CfnPipeline(self, "MyCfnPipeline",
            pipeline_name = "CDKPipeline",
            pipeline_activities = [iotanalytics.CfnPipeline.ActivityProperty(
                channel = iotanalytics.CfnPipeline.ChannelProperty(
                    channel_name = cfn_channel.channel_name,
                    name = "CDKChannelName",
                    next = "CDKDatastoreActivity"
                ),
                datastore=iotanalytics.CfnPipeline.DatastoreProperty(
                datastore_name=cfn_datastore.datastore_name,
                name="CDKDatastoreActivity"
            )
            )]
        )