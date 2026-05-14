locals {
  public_ingress_allowed = ["443/tcp"]
  internal_only_services = ["api", "n8n"]
  secrets_handled_in     = "terraform-cloud-or-keyvault"
  logging_policy         = "no-pii-no-secrets"
}