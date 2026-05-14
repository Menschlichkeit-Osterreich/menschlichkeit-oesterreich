locals {
  vm_sku            = "Standard_B2s"
  proxy_vm_name     = "moe-proxy"
  backend_vm_name   = "moe-backend"
  storage_mount     = "/var/lib/moe"
  restore_snapshot  = true
}
