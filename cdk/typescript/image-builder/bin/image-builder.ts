#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ImageBuilderStack } from '../lib/image-builder-stack';

const app = new cdk.App();
new ImageBuilderStack(app, 'ImageBuilderStack');
