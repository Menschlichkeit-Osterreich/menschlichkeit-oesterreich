package mcp.policy.toolio

default allow_input = false
default allow_output = false

# Parameters
max_input_bytes := 262144  # 256 KiB
allowed_services := {"api", "crm", "frontend", "games", "website", "n8n", "root"}

# Input schema: {
#   "service": string,
#   "filePath": string,
#   "args": object (optional)
# }

allow_input {
  input.service != ""
  input.filePath != ""
  input.service \u2208 allowed_services
  not path_traversal(input.filePath)
  input_size_ok
}

input_size_ok {
  not input._bytes
}
input_size_ok {
  input._bytes <= max_input_bytes
}

path_traversal(p) {
  contains(p, "../")
} else {
  startswith(p, "/")
} else {
  contains(p, "..\\")
}

# Output schema: {
#   "content": string | array
# }

allow_output {
  not contains(to_string(input.content), "-----BEGIN PRIVATE KEY-----")
  not contains(to_string(input.content), "AWS_SECRET_ACCESS_KEY")
  not contains(to_string(input.content), "x-api-key")
}

to_string(x) = s {
  s := sprintf("%v", [x])
}

