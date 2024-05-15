package com.myorg;

import software.constructs.Construct;
import software.amazon.awscdk.RemovalPolicy;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;

import software.amazon.awscdk.services.s3.*;
import java.util.*;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.services.s3.LifecycleRule;
import software.amazon.awscdk.services.iam.*;
import software.amazon.awscdk.services.s3.CfnBucket.*;


public class S3BucketStack extends Stack {
    public S3BucketStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public S3BucketStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        
    // An S3 bucket with versioning enabled, object lock disabled, public access blocked, and S3 encryption enabled
    Bucket s3bucket = Bucket.Builder.create(this, "testing-bucket-cw-iac-examples")
         .bucketName("testing-bucket-cw-iac-examples")
         .blockPublicAccess(BlockPublicAccess.BLOCK_ALL)
         .encryption(BucketEncryption.S3_MANAGED)
         .enforceSsl(true)
         .versioned(true)
         .removalPolicy(RemovalPolicy.RETAIN)
         .objectLockEnabled(false)
         .serverAccessLogsPrefix("s3-java-access-logs")
         .build();
         
    s3bucket.addLifecycleRule(LifecycleRule.builder()
                            .id("abortIncompleteUploads")
                            .abortIncompleteMultipartUploadAfter(Duration.days(1))
                            .build());

    //A bucket that is used as a target for replicas from the main source bucket
    Bucket s3destinationbucket= Bucket.Builder.create(this, "testing-bucket-cw-iac-examples-destination")
        .bucketName("testing-bucket-cw-iac-examples-destination")
        .blockPublicAccess(BlockPublicAccess.BLOCK_ALL)
        .versioned(true)
        .encryption(BucketEncryption.S3_MANAGED)
        .enforceSsl(true)
        .removalPolicy(RemovalPolicy.RETAIN)
        .build();
    s3destinationbucket.addLifecycleRule(LifecycleRule.builder()
                            .id("abortIncompleteUploads")
                            .abortIncompleteMultipartUploadAfter(Duration.days(1))
                            .build());


    //Create an IAM role to be used for bucket replication
     Role replicationrole = Role.Builder.create(this, "replication-role")
         .assumedBy(new ServicePrincipal("s3.amazonaws.com"))
         .path("/service-role/")
         .build();
     
    //Add required IAM policies to replication role
      replicationrole.addToPolicy(PolicyStatement.Builder.create()
         .resources(List.of(s3bucket.getBucketArn()))
         .actions(List.of("s3:GetReplicationConfiguration","s3:ListBucket"))
         .build());
         

     //Add required IAM policies to access source bucket contents to replication role
       replicationrole.addToPolicy(PolicyStatement.Builder.create()
         .resources(List.of(s3bucket.arnForObjects("*")))
         .actions(List.of(
                            "s3:GetObjectVersion",
                            "s3:GetObjectVersionAcl",
                            "s3:GetObjectVersionTagging",
                            "s3:GetObjectVersionForReplication",
                            "s3:GetObjectLegalHold",
                            "s3:GetObjectVersionTagging",
                            "s3:GetObjectRetention"
                        ))
         .build());


    // Add required IAM policies to access replication target bucket contents to
    // replication role
       replicationrole.addToPolicy(PolicyStatement.Builder.create()
         .resources(List.of(s3destinationbucket.arnForObjects("*")))
         .actions(List.of(
                           "s3:ReplicateObject",
                           "s3:ReplicateDelete",
                           "s3:ReplicateTags",
                           "s3:GetObjectVersionTagging",
                           "s3:ObjectOwnerOverrideToBucketOwner"
                        ))
         .build());  
         
    //Use a CDK escape hatch for the source S3 bucket
       CfnBucket s3cfnbucket  =  (CfnBucket)s3bucket.getNode().getDefaultChild();
        
    //Update the Replication Configuration property directly on the source bucket
    //to copy contents to the target bucket
       ReplicationConfigurationProperty replicationConfigurationProperty = ReplicationConfigurationProperty.builder()
         .role(replicationrole.getRoleArn())
         .rules(List.of(ReplicationRuleProperty.builder()
                 .destination(ReplicationDestinationProperty.builder()
                         .bucket(s3destinationbucket.getBucketArn())
                         .build())
                 .status("Enabled")
                 // the properties below are optional
                 .id("replication-rule-1")
                 .build()))
         .build();
         
        s3cfnbucket.setReplicationConfiguration(replicationConfigurationProperty); 

   }

    
}

