import * as cdk from 'aws-cdk-lib';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import { Construct } from 'constructs';

export class OpensearchSimpleDomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = new opensearch.Domain(this, 'OpenSearchDomain', {
      domainName: 'my-opensearch-domain',
      version: opensearch.EngineVersion.OPENSEARCH_2_3,
      capacity: {
        dataNodes: 1,
        dataNodeInstanceType: 'r6g.large.search',
      },
      ebs: {
        volumeSize: 10,
        volumeType: cdk.aws_ec2.EbsDeviceVolumeType.GP3,
      },
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
    });

    new cdk.CfnOutput(this, 'DomainEndpoint', {
      value: domain.domainEndpoint,
      description: 'OpenSearch Domain Endpoint',
    });
  }
}


