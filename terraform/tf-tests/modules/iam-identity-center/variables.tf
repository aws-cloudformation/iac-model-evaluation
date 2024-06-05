# Groups
variable "sso_groups" {
  description = "Names of the groups you wish to create in IAM Identity Center"
  type        = map(any)
  default     = {}

  # validation {
  #   condition     = alltrue([for group in values(var.sso_groups) : length(group.group_name) >= 3 && length(group.group_name) <= 128])
  #   error_message = "The name of one of the defined IAM Identity Center Groups is too long. Group names can be a maxmium of 128 characters, as the names are used by other resources throughout this module. This can cause deployment failures for AWS resources with smaller character limits for naming. Please ensure all group names are 128 characters or less, and try again."
  # }
}

# Users
variable "sso_users" {
  description = "Names of the users you wish to create in IAM Identity Center"
  type        = map(any)
  default     = {}

  validation {
    condition     = alltrue([for user in values(var.sso_users) : length(user.user_name) >= 3 && length(user.user_name) <= 128])
    error_message = "The name of one of the defined IAM Identity Center usernames is too long. Usernames can be a maxmium of 128 characters, as the names are used by other resources throughout this module. This can cause deployment failures for AWS resources with smaller character limits for naming. Please ensure all group names are 128 characters or less, and try again."
  }
}

# Permission Sets
variable "permission_sets" {
  description = "Map of maps containing Permission Set names as keys. See permission_sets description in README for information about map values."
  type        = any
  default = {
    # key
    AdministratorAccess = {
      # values
      description      = "Provides full access to AWS services and resources.",
      session_duration = "PT2H",
      managed_policies = ["arn:aws:iam::aws:policy/AdministratorAccess"]
    }
  }
}

#  Account Assignments
variable "account_assignments" {
  description = "List of maps containing mapping between user/group, permission set and assigned accounts list. See account_assignments description in README for more information about map values."
  type        = map(any)

  default = {}
}
