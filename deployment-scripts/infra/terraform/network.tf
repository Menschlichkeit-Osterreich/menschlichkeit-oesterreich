locals {
  vnet_cidr              = "10.40.0.0/16"
  public_proxy_subnet    = "10.40.1.0/24"
  private_backend_subnet = "10.40.2.0/24"
  allowed_public_entry   = "reverse-proxy"
}