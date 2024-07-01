provider "aws" {
   region = var.aws_region
   shared_config_files      = [".aws/config"]
   shared_credentials_files = [".aws/credentials"]
   profile                  = "fiap-iac"
}