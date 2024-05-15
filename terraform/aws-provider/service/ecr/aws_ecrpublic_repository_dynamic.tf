# create variable type object called catalog_data with attributes: about_text, architectures, description. Set default to null
variable "website_settings" {
  type = object({
    about_text    = string
    architectures = list(string)
    description   = string
  })
  default = null
}

# create ecr public repository, use dynamic block for catalog_data, iterate over website_settings object
resource "aws_ecrpublic_repository" "example" {
  repository_name = "example"

  dynamic "catalog_data" {
    for_each = var.website_settings[*]

    content {
      about_text    = catalog_data.value.about_text
      architectures = catalog_data.value.architectures
      description   = catalog_data.value.description
    }
  }
}