#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DocDBStack } from '../lib/docdb-stack';

const app = new cdk.App();
new DocDBStack(app, 'DocDBStack',{
    env: {
        region: 'ap-southeast-2'
    }
});
