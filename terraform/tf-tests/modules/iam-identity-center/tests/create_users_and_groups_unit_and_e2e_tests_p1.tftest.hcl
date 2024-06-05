# Create a unit and e2e test that creates the minimum required resources and validates that the names of the users and groups match the expected values

# HINT: Make sure to run `terraform init` in this directory before running `terraform test`. Also, ensure you use constant values (e.g. string, number, bool, etc.) within your tests where at all possible or you may encounter errors.

variables {
  sso_groups = {
    TestGroup1 : {
      group_name        = "TestGroup1"
      group_description = "TestGroup1 IAM Identity Center Group"
    },
    TestGroup2 : {
      group_name        = "TestGroup2"
      group_description = "Test IAM Identity Center Group"
    },
  }

  // Create desired USERS in IAM Identity Center
  sso_users = {
    TestUser1 : {
      group_membership = ["TestGroup1", "TestGroup2", ]
      user_name        = "TestUser1"
      given_name       = "Test"
      family_name      = "User1"
      email            = "testuser1@email.com"
    },
    TestUser2 : {
      group_membership = ["TestGroup2", ]
      user_name        = "TestUser2"
      given_name       = "Test"
      family_name      = "User2"
      email            = "testuser2@email.com"
    },
  }

  // Create permissions sets backed by AWS managed policies
  permission_sets = {
    AdministratorAccess = {
      description          = "Provides AWS full access permissions.",
      session_duration     = "PT4H", // how long until session expires - this means 4 hours. max is 12 hours
      aws_managed_policies = ["arn:aws:iam::aws:policy/AdministratorAccess"]
      tags                 = { ManagedBy = "Terraform" }
    },
    ViewOnlyAccess = {
      description          = "Provides AWS view only permissions.",
      session_duration     = "PT3H", // how long until session expires - this means 3 hours. max is 12 hours
      aws_managed_policies = ["arn:aws:iam::aws:policy/job-function/ViewOnlyAccess"]
      tags                 = { ManagedBy = "Terraform" }
    },
  }

  // Assign users/groups access to accounts with the specified permissions
  account_assignments = {
    TestGroup1 : {
      principal_name  = "TestGroup1"                              // name of the user or group you wish to have access to the account(s)
      principal_type  = "GROUP"                                   // entity type (user or group) you wish to have access to the account(s). Valid values are "USER" or "GROUP"
      permission_sets = ["AdministratorAccess", "ViewOnlyAccess"] // permissions the user/group will have in the account(s)
      account_ids = [                                             // account(s) the group will have access to. Permissions they will have in account are above line
        "286510435300",
        # local.account2_account_id,
        # local.account3_account_id, // these are defined in a locals.tf file, example is in this directory
        # local.account4_account_id,
      ]
    },
    TestGroup2 : {
      principal_name  = "TestGroup2"
      principal_type  = "GROUP"
      permission_sets = ["ViewOnlyAccess"]
      account_ids = [
        "286510435300",
        # local.account2_account_id,
        # local.account3_account_id,
        # local.account4_account_id,
      ]
    },
  }
}

run "unit_tests" {
  command = plan

  # Check that the group_name for the "TestGroup1" group starts with "TestGroup1"
  assert {
    condition     = startswith(aws_identitystore_group.sso_groups["TestGroup1"].display_name, "TestGroup1")
    error_message = "The Identity Store Group name (${aws_identitystore_group.sso_groups["TestGroup1"].display_name}  didn't match the expected value."
  }

  # Check that the user_name for the "TestUser1" user starts with "TestUser1"
  assert {
    condition     = startswith(aws_identitystore_user.sso_users["TestUser1"].user_name, "TestUser1")
    error_message = "The Identity Store user name (${aws_identitystore_user.sso_users["TestUser1"].user_name}  didn't match the expected value."
  }
}

run "e2e_tests" {
  command = apply

  # Check that the group_name for the "TestGroup1" group starts with "TestGroup1"
  assert {
    condition     = startswith(aws_identitystore_group.sso_groups["TestGroup1"].display_name, "TestGroup1")
    error_message = "The Identity Store Group name (${aws_identitystore_group.sso_groups["TestGroup1"].display_name}  didn't match the expected value."
  }

  # Check that the user_name for the "TestUser1" user starts with "TestUser1"
  assert {
    condition     = startswith(aws_identitystore_user.sso_users["TestUser1"].user_name, "TestUser1")
    error_message = "The Identity Store user name (${aws_identitystore_user.sso_users["TestUser1"].user_name}  didn't match the expected value."
  }
}

