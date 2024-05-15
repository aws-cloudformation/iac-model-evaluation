package com.myorg;

import software.constructs.Construct;

import java.security.Provider.Service;
import java.util.List;

import javax.xml.transform.Source;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.kms.*;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.services.rds.DatabaseInstance;
import software.amazon.awscdk.services.rds.DatabaseSecret;
import software.amazon.awscdk.services.rds.DatabaseInstanceEngine;
import software.amazon.awscdk.services.rds.Credentials;

// import software.amazon.awscdk.Duration;
// import software.amazon.awscdk.services.sqs.Queue;

public class RdsMysqlStack extends Stack {
    public RdsMysqlStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public RdsMysqlStack(final Construct scope, final String id, final StackProps props) {
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

        //Create RDS MySQL instance with encrption , multiaz, monitoring & backup enabled
        DatabaseInstance rdsinstance = DatabaseInstance.Builder.create(this, "rds-mysql-cw-iac-example")
         .engine(DatabaseInstanceEngine.MYSQL)
         .deletionProtection(true)
         .storageEncrypted(true)
         .iamAuthentication(true)
         .monitoringInterval(Duration.seconds(60))
         .credentials(Credentials.fromSecret(rdsusernamesecret))
         .vpc(vpc)
         .vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PRIVATE_ISOLATED).build())
         .multiAz(true)
         .cloudwatchLogsExports(List.of("audit", "error", "general", "slowquery"))
         .autoMinorVersionUpgrade(true)
         .backupRetention(Duration.days(1))
         .build();

         //Rotate master password for RDS instance
         rdsinstance.addRotationSingleUser();

    }
}
