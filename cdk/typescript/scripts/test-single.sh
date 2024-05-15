#!/bin/bash

set -eou pipefail

echo "Installing Dependencies..."
npm ci

echo "Linting..."
npx eslint .

echo "Synthing..."
npx cdk synth -q

echo "Checkov..."
checkov --framework cloudformation --quiet -f cdk.out/*.template.json

echo "Guard..."
cfn-guard validate \
    --rules ../../../cloudformation/rules/guard-rules-registry-all-rules.guard \
    --show-summary fail --data cdk.out/*.template.json


