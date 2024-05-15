# CloudFormation templates

Templates should all be placed in the top level of this directory. Author
templates in YAML and use the included script to generate the JSON.  For
example, `./scripts/create-json-single.sh bucket.yaml`.  Validate the template
using the CloudFormation Linter (cfn-lint), Checkov, and CloudFormation Guard
(cfn-guard).  See `scripts/test-single.sh` for examples.

Also deploy your templates to make sure they actually work.  See
`scripts/integ-all.sh`. Templates should be self-contained and not require any
prior resources to be installed, so that we can reliably run the integ script
with automation.

## Prerequisites

### cfn-lint

### rain

### cfn-guard

### checkov



