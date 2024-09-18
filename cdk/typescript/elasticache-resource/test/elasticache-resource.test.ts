import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ElasticacheResource from '../lib/elasticache-resource-stack';

test('Elasticache Stack Created', () => {
  const app = new cdk.App();

  const stack = new ElasticacheResource.ElasticacheResourceStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);

});
