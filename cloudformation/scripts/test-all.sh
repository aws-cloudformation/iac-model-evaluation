#!/usr/local/bin/bash
#
# Run this script from the cloudformation directory
#

set -eou pipefail

echo "Generating JSON files..."
./scripts/create-json-all.sh

echo "Linting..."
cfn-lint *.yaml
cfn-lint *.json

echo "Checkov..."
checkov --framework cloudformation --quiet -f *.yaml
checkov --framework cloudformation --quiet -f *.json

echo "Guard..."
cfn-guard validate --data . \
    --rules rules/guard-rules-registry-all-rules.guard \
    --show-summary fail
#docker run -v $(pwd):/mnt/templates \
#    -it public.ecr.aws/w3f9i5a5/iac-checks \
#    cfn-guard validate --data /mnt/templates \
#    --rules /opt/rules/guard-rules-registry-all-rules.guard

echo "Success"
