#!/usr/local/bin/bash
#
# Test a single template by deploying and deleting it
#
# $1 is the file name
set -eou pipefail

FILE_NAME=$1
PREFIX=cw-iac-eval
BASENAME=$(basename "${FILE_NAME%.*}")
STACK_NAME="${PREFIX}-${BASENAME}"
echo "About to deploy $1 with stack name ${STACK_NAME}"
rain deploy --params ResourceNamePrefix=${PREFIX} \
    --ignore-unknown-params -y $1 ${STACK_NAME} 
rain rm -y ${STACK_NAME}


