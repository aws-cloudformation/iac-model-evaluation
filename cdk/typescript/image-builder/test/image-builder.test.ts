import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as ImageBuilder from '../lib/image-builder-stack';

test('ImageBuilder stack created', () => {
  const app = new cdk.App();
  const stack = new ImageBuilder.ImageBuilderStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
});