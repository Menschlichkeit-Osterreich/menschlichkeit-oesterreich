variable "location" {
  type        = string
  description = "Azure region for the masterplan infrastructure"
  default     = "westeurope"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name for the masterplan"
  default     = "rg-moe-masterplan"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prod"
}

variable "public_proxy_fqdn" {
  type        = string
  description = "Public DNS name for the reverse proxy"
}

variable "alert_email" {
  type        = string
  description = "Primary alert mailbox"
  default     = "vorstand@menschlichkeit-oesterreich.at"
}