#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StepfunctionsStack } from '../lib/stepfunctions-stack';

const app = new cdk.App();
new StepfunctionsStack(app, 'StepfunctionsStack');
