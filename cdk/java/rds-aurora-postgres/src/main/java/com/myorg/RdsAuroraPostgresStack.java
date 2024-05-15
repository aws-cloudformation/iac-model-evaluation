package com.myorg;

import software.constructs.Construct;

import java.util.List;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.services.kms.*;
import software.amazon.awscdk.services.ec2.Vpc;
import software.amazon.awscdk.services.ec2.IpAddresses;
import software.amazon.awscdk.services.ec2.SubnetType;
import software.amazon.awscdk.services.ec2.SubnetConfiguration;
import software.amazon.awscdk.services.ec2.InstanceClass;
import software.amazon.awscdk.services.ec2.InstanceSize;
import software.amazon.awscdk.services.ec2.InstanceType;
import software.amazon.awscdk.services.ec2.SubnetSelection;
import software.amazon.awscdk.services.rds.*;
import software.amazon.awscdk.services.rds.AuroraPostgresEngineVersion;
import software.amazon.awscdk.services.rds.DatabaseInstance;
import software.amazon.awscdk.services.rds.DatabaseSecret;
import software.amazon.awscdk.services.rds.DatabaseInstanceEngine;
import software.amazon.awscdk.services.rds.Credentials;
import software.amazon.awscdk.services.rds.DatabaseClusterEngine;
import software.amazon.awscdk.services.rds.ClusterInstance;
//import software.amazon.awscdk.services.rds.InstanceType;
// import software.amazon.awscdk.services.sqs.Queue;

public class RdsAuroraPostgresStack extends Stack {
    public RdsAuroraPostgresStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public RdsAuroraPostgresStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

    
    //Create basic VPC with cidr block 10.0.0.0/16
         Vpc vpc = Vpc.Builder.create(this, "vpc-cw-iac-example")
         .ipAddresses(IpAddresses.cidr("10.0.0.0/16"))
         .maxAzs(2)
         .restrictDefaultSecurityGroup(false)
         .natGateways(0)
         .subnetConfiguration(List.of(SubnetConfiguration.builder()
                                .name("RDS")
                                .subnetType(SubnetType.PRIVATE_ISOLATED)
                                  // the properties below are optional
                                .cidrMask(24)
                                .build()))
         .build();

    //Create username and password secret for RDS instance
        DatabaseSecret rdsusernamesecret = DatabaseSecret.Builder.create(this, "rds-secret-cw-iac-example")
        .username("clusteradmin")
        .encryptionKey(Key.Builder.create(this, "kms-secret-cw-iac-example")
                         .enableKeyRotation(true)
                       .build())
        .build();

    //Create Aurora PostgreSQL cluster with version 15. 
        DatabaseCluster aurorainstance = DatabaseCluster.Builder.create(this, "rds-aurora-postgres-cw-iac-example")
        .engine(DatabaseClusterEngine.auroraPostgres(AuroraPostgresClusterEngineProps.builder().version(AuroraPostgresEngineVersion.VER_15_2).build()))
        .writer(ClusterInstance.provisioned("writer", ProvisionedClusterInstanceProps.builder()
                .instanceType(InstanceType.of(InstanceClass.R6G, InstanceSize.XLARGE4))
                .build()))
        .serverlessV2MinCapacity(6.5)
        .serverlessV2MaxCapacity(64)
        .readers(List.of(ClusterInstance.serverlessV2("reader1", ServerlessV2ClusterInstanceProps.builder().scaleWithWriter(true).build()), ClusterInstance.serverlessV2("reader2")))
        .vpc(vpc)
        .vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PRIVATE_ISOLATED).build())
        .deletionProtection(true)
        .storageEncrypted(true)
        .storageEncryptionKey(Key.Builder.create(this, "aurora-encryptionkey-cw-iac-example").enableKeyRotation(true).build())
        .iamAuthentication(true)
        .monitoringInterval(Duration.seconds(0))
        .credentials(Credentials.fromSecret(rdsusernamesecret))
        .cloudwatchLogsExports(List.of("postgresql"))
        .backup(BackupProps.builder().retention(Duration.days(1)).build())
        .build();

    }     
}
