import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ElasticLoadBalancingV2Resources from '../lib/elasticloadbalancingv2-resources-stack';

test('LoadBalancerv2 stack Created', () => {
  const app = new cdk.App();
  const stack = new ElasticLoadBalancingV2Resources.ElasticLoadBalancingV2ResourcesStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
});
