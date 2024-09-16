import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Docdb from '../lib/docdb-stack';

test('DocDB stack Created', () => {
  const app = new cdk.App();
  const stack = new Docdb.DocDBStack(app, 'MyTestDocDBStack');
  const template = Template.fromStack(stack);
});
