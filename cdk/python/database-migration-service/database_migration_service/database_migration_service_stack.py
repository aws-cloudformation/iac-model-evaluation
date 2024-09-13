from aws_cdk import (
    Stack,
    CfnParameter,
    CfnCondition,
    Fn,
    aws_iam as iam,
    aws_dms  as dms,
    aws_secretsmanager as secretsmanager,
    aws_kms as kms
)
from constructs import Construct

class DatabaseMigrationServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Parameters
        
        #This will be used in DMS Replication SubnetGroup
        dms_subnet1 = 'subnet-xxxx'
        
        #This will be used in DMS Replication SubnetGroup, please provide a Subnet in the same VPC but in a different Availability Zone than DBSubnet1
        dms_subnet2 = 'subnet-xxxx'
    
        #Specifies the VPC security group to be used with the replication instance
        dms_security_group = 'sg-xxxx'
        
        #Specifies the compute and memory capacity of the replication instance
        dms_instance_class = 'dms.t3.medium'
    
        #Specifies a name for the replication instance
        dms_instance_name = 'sample-repinstance'
        
        #Specifies the PostgreSql Database Name you want to use as Target Endpoint
        postgresql_database_name = 'sample-postgresql-for-dms'
        
        #Specifies the ServerName to be used with the DMS source endpoint (Writer endpoint of the Database)
        server_name = '<aurora-cluster-name>.cluster-<uuid>.<region>.rds.amazonaws.com'
        
        #Specifies the BucketName to be used with the DMS target endpoint
        bucket_name = 'sample-bucket-name'

        #If the dms-vpc-role exists in your account, please enter Y, else enter N
        exists_dms_vpc_role = 'N'

        #If the dms-cloudwatch-logs-role exists in your account, please enter Y, else enter N
        exists_dms_cloudwatch_role ='N'


        # Conditions
        not_exists_dms_vpc_role = CfnCondition(self, "NotExistsDMSVPCRole",
            expression=Fn.condition_equals(exists_dms_vpc_role, "N")
        )

        not_exists_dms_cloudwatch_role = CfnCondition(self, "NotExistsDMSCloudwatchRole",
            expression=Fn.condition_equals(exists_dms_cloudwatch_role, "N")
        )
        
        
        # Resources
        
        # IAM role 'dms-cloudwatch-logs-role' to provide access to upload DMS replication logs to cloudwatch logs 
        dms_cloudwatch_role = iam.Role(self, "DMSCloudwatchRole",
            role_name="dms-cloudwatch-logs-role",
            assumed_by=iam.ServicePrincipal("dms.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonDMSCloudWatchLogsRole")
            ]
        )
        cfn_dms_cloudwatch_role = dms_cloudwatch_role.node.default_child
        cfn_dms_cloudwatch_role.cfn_options.condition = not_exists_dms_cloudwatch_role
        
        
        # IAM role 'dms-vpc-role' to manage VPC settings for AWS managed customer configurations
        dms_vpc_role = iam.Role(self, "DMSVpcRole",
            role_name="dms-vpc-role",
            assumed_by=iam.ServicePrincipal("dms.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonDMSVPCManagementRole")
            ]
        )
        cfn_dms_vpc_role = dms_vpc_role.node.default_child
        cfn_dms_vpc_role.cfn_options.condition = not_exists_dms_vpc_role
        
        
        # IAM role with write and delete access to the S3 bucket
        s3_target_dms_role = iam.Role(self, "S3TargetDMSRole",
            role_name="dms-s3-target-role",
            assumed_by=iam.ServicePrincipal("dms.amazonaws.com"),
            inline_policies={
                "S3AccessForDMSPolicy": iam.PolicyDocument(statements=[
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=["s3:PutObject", "s3:DeleteObject"],
                        resources=[
                            Fn.sub(f"arn:aws:s3:::{bucket_name}"),
                            Fn.sub(f"arn:aws:s3:::{bucket_name}/*")
                        ]
                    ),
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=["s3:ListBucket"],
                        resources=[Fn.sub(f"arn:aws:s3:::{bucket_name}")]
                    )
                ])
            }
        )


        # DMS Replication Subnet Group
        dms_replication_subnet_group = dms.CfnReplicationSubnetGroup(self, "DMSReplicationSubnetGroup",
            replication_subnet_group_description="Subnets available for DMS",
            subnet_ids=[dms_subnet1, dms_subnet2]
        )
        dms_replication_subnet_group.node.add_dependency(s3_target_dms_role)


        # DMS Replication Instance
        dms_replication_instance = dms.CfnReplicationInstance(self, "DMSReplicationInstance",
            replication_instance_class=dms_instance_class,
            replication_instance_identifier=dms_instance_name,
            replication_subnet_group_identifier=dms_replication_subnet_group.ref,
            vpc_security_group_ids=[dms_security_group],
            multi_az=True,
            publicly_accessible=False
        )
        
      
        ########################################################################
        # Replicate data from Aurora to S3 with AWS Database Migration Service #
        ########################################################################
        # Get the secret that store the Aurora Database username and password
        secrets_manager_secret_arn_for_aurora = secretsmanager.Secret.from_secret_complete_arn(self, 'SecretsManagerSecretNameforAurora', 
          secret_complete_arn='arn:aws:secretsmanager:<aws_region>:<aws_account>:secret:<secret_name>-uuid'
        )
        
        # Aurora Source Endpoint
        aurora_source_endpoint = dms.CfnEndpoint(self, "AuroraSourceEndpoint",
            endpoint_type="source",
            engine_name="aurora",
            username=Fn.sub(f"{{resolve:secretsmanager:{secrets_manager_secret_arn_for_aurora.secret_name}:SecretString:username}}"),
            password=Fn.sub(f"{{resolve:secretsmanager:{secrets_manager_secret_arn_for_aurora.secret_name}:SecretString:password}}"),
            port=3306,
            server_name=server_name
        )
        aurora_source_endpoint.node.add_dependency(dms_replication_instance)

        
        # S3 Target Endpoint
        s3_target_endpoint = dms.CfnEndpoint(self, "S3TargetEndpoint",
            endpoint_type="target",
            engine_name="s3",
            extra_connection_attributes="addColumnName=true",
            s3_settings=dms.CfnEndpoint.S3SettingsProperty(
                bucket_name=bucket_name,
                service_access_role_arn=s3_target_dms_role.role_arn
            )
        )
        s3_target_endpoint.node.add_dependency(dms_replication_instance)


        ###############################################################################
        # Replicate data from MySQL to PostgreSQL with AWS Database Migration Service #
        ###############################################################################
        # Get SecretsManagerSecret that contains the MySQL endpoint connection detail
        secrets_manager_secret_arn_for_mysql = secretsmanager.Secret.from_secret_complete_arn(self, 'SecretsManagerSecretARNforMySql', 
          secret_complete_arn='arn:aws:secretsmanager:<aws_region>:<aws_account>:secret:<secret_name>-uuid'
        )
                
        # Get SecretsManagerSecret that contains the PostgreSQL endpoint connection detail
        secrets_manager_secret_arn_for_postgresql = secretsmanager.Secret.from_secret_complete_arn(self, 'SecretsManagerSecretARNforPostgreSql', 
          secret_complete_arn='arn:aws:secretsmanager:<aws_region>:<aws_account>:secret:<secret_name>-uuid'
        )
        
        # Get KMS Arn that encrypt your secret for MySql Database
        kms_arn_encrypt_secret_for_mysql = kms.Key.from_key_arn (self, 'KmsArnEncryptSecretforMySqlDatabase',
          key_arn = 'arn:aws:kms:<aws_region>:<aws_account>:key/<key_id>'
        )
        
        # Get KMS Arn that encrypt your secret for PostgreSql Database
        kms_arn_encrypt_secret_for_postgresql = kms.Key.from_key_arn (self, 'KmsArnEncryptSecretforPostgreSqlDatabase',
          key_arn = 'arn:aws:kms:<aws_region>:<aws_account>:key/<key_id>'
        )       
        
        # IAM role to access SecretsManager
        secrets_manager_access_role_for_databases = iam.Role(self, "SecretsManagerAccessRoleForDatabases",
            role_name="dms-secret-manager-access-role",
            assumed_by=iam.ServicePrincipal("dms.amazonaws.com"),
            inline_policies={
                "SecretsManagerPolicy": iam.PolicyDocument(statements=[
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=["kms:Decrypt", "kms:DescribeKey"],
                        resources=[
                            kms_arn_encrypt_secret_for_mysql.key_arn,
                            kms_arn_encrypt_secret_for_postgresql.key_arn
                        ]
                    ),
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=["secretsmanager:GetSecretValue"],
                        resources=[
                            secrets_manager_secret_arn_for_mysql.secret_arn,
                            secrets_manager_secret_arn_for_postgresql.secret_arn
                        ]
                    )
                ])
            }
        )

        # MySQL Source Endpoint
        mysql_source_endpoint = dms.CfnEndpoint(self, "MySQLSourceEndpoint",
            endpoint_type="source",
            engine_name="mysql",
            my_sql_settings=dms.CfnEndpoint.MySqlSettingsProperty(
                secrets_manager_access_role_arn=secrets_manager_access_role_for_databases.role_arn,
                secrets_manager_secret_id=secrets_manager_secret_arn_for_mysql.secret_arn
            )
        )
        mysql_source_endpoint.node.add_dependency(dms_replication_instance)

        # PostgreSQL Target Endpoint
        postgresql_target_endpoint = dms.CfnEndpoint(self, "PostgreSqlTargetEndpoint",
            endpoint_type="target",
            engine_name="postgres",
            database_name=postgresql_database_name,
            postgre_sql_settings=dms.CfnEndpoint.PostgreSqlSettingsProperty(
                secrets_manager_access_role_arn=secrets_manager_access_role_for_databases.role_arn,
                secrets_manager_secret_id=secrets_manager_secret_arn_for_postgresql.secret_arn
            )
        )
        postgresql_target_endpoint.node.add_dependency(dms_replication_instance)

        
        # Replication Task From Aurora Source to S3 Target
        dms_replication_task_from_aurora_to_s3 = dms.CfnReplicationTask(self, "DMSReplicationTaskFromAuroraSourcetoS3Target",
            migration_type="full-load-and-cdc",
            replication_instance_arn=dms_replication_instance.ref,
            replication_task_settings='{"Logging": {"EnableLogging": true, "LogComponents": [{"Id": "SOURCE_UNLOAD", "Severity": "LOGGER_SEVERITY_DEFAULT"}, {"Id": "SOURCE_CAPTURE", "Severity": "LOGGER_SEVERITY_DEFAULT"}, {"Id": "TARGET_LOAD", "Severity": "LOGGER_SEVERITY_DEFAULT"}, {"Id": "TARGET_APPLY", "Severity": "LOGGER_SEVERITY_DEFAULT"}]}}',
            source_endpoint_arn=aurora_source_endpoint.ref,
            table_mappings='{"rules": [{"rule-type": "selection", "rule-id": "1", "rule-name": "1", "object-locator": {"schema-name": "%", "table-name": "%"}, "rule-action": "include"}]}',
            target_endpoint_arn=s3_target_endpoint.ref
        )
        
        
        # Replication Task From MySQL Source to PostgreSQL Target
        dms_replication_task_from_mysql_to_postgresql = dms.CfnReplicationTask(self, "DMSReplicationTaskFromMySQLSourcetoPostgreSQLTarget",
            migration_type="full-load",
            replication_instance_arn=dms_replication_instance.ref,
            replication_task_settings='{"FullLoadSettings": {"CommitRate": 10000, "TargetTablePrepMode": "DROP_AND_CREATE", "CreatePkAfterFullLoad": true}, "BeforeImageSettings": null, "ControlTablesSettings": {"historyTimeslotInMinutes": 5, "HistoryTimeslotInMinutes": 5}}',
            source_endpoint_arn=mysql_source_endpoint.ref,
            table_mappings='{"rules": [{"rule-type": "selection", "rule-id": "1", "rule-name": "1", "object-locator": {"schema-name": "%", "table-name": "%"}, "rule-action": "include"}]}',
            target_endpoint_arn=postgresql_target_endpoint.ref
        )