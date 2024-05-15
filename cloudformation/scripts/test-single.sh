#!/usr/local/bin/bash

set -eou pipefail

echo "Linting..."
cfn-lint $1

echo "Checkov..."
checkov --framework cloudformation --quiet -f $1

echo "Guard..."
cfn-guard validate --data $1 \
    --rules rules/guard-rules-registry-all-rules.guard \
    --show-summary fail

echo "Success"
