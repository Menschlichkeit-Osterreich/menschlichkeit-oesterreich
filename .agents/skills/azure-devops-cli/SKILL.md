---
name: azure-devops-cli
description: Manage Azure DevOps resources via CLI including projects, repos, pipelines, builds, pull requests, work items, artifacts, and service endpoints. Use when working with Azure DevOps, az commands, devops automation, CI/CD, or when user mentions Azure DevOps CLI.
---

# Azure DevOps CLI

This Skill helps manage Azure DevOps resources using the Azure CLI with Azure DevOps extension.

**CLI Version:** 2.81.0 (current as of 2025)

## Prerequisites

```bash
brew install azure-cli  # macOS
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  # Linux
az extension add --name azure-devops
```

## Authentication

```bash
az devops login --organization https://dev.azure.com/{org}
az devops login --organization https://dev.azure.com/{org} --token YOUR_PAT
az devops configure --defaults organization=https://dev.azure.com/{org} project={project}
```

---

## Projects

```bash
az devops project list
az devops project show --project {project}
az devops project create --name {name} --description "{desc}" --visibility private
az devops project delete --id {id} --yes
```

---

## Repositories

```bash
az repos list --project {project}
az repos show --repository {repo}
az repos create --name {name} --project {project}
az repos delete --id {id} --yes

# Clone URL
az repos show --repository {repo} --query remoteUrl -o tsv
```

---

## Pull Requests

```bash
az repos pr list --project {project} --repository {repo} --status active
az repos pr show --id {pr-id}
az repos pr create \
  --title "feat: ..." \
  --source-branch feature/my-branch \
  --target-branch main \
  --description "PR description"
az repos pr update --id {pr-id} --status completed --merge-strategy squash
az repos pr update --id {pr-id} --auto-complete true
az repos pr reviewer add --id {pr-id} --reviewers user@example.com

# Abandon PR
az repos pr update --id {pr-id} --status abandoned
```

---

## Pipelines

```bash
az pipelines list --project {project}
az pipelines show --name {pipeline-name}
az pipelines create \
  --name {name} \
  --repository {repo} \
  --branch main \
  --yml-path .azure-pipelines/pipeline.yml

# Run pipeline
az pipelines run --name {pipeline-name} --branch main
az pipelines run --id {pipeline-id} --parameters key=value

# Delete
az pipelines delete --id {id} --yes
```

---

## Builds

```bash
az pipelines build list --project {project} --branch main
az pipelines build show --id {build-id}
az pipelines build queue --definition-id {def-id}
az pipelines build cancel --id {build-id}

# Download artifacts
az pipelines build artifact download \
  --build-id {build-id} \
  --artifact-name {name} \
  --path ./artifacts
```

---

## Releases

```bash
az pipelines release definition list --project {project}
az pipelines release list --project {project}
az pipelines release create --definition-id {id} --artifact-metadata-list "{...}"
az pipelines release show --id {release-id}
```

---

## Work Items

```bash
az boards work-item show --id {id}
az boards work-item create \
  --title "Fix: ..." \
  --type Task \
  --project {project} \
  --assigned-to user@example.com \
  --priority 2

az boards work-item update --id {id} --state Active
az boards work-item update --id {id} --state Closed
az boards work-item delete --id {id} --yes

# Query work items
az boards query --wiql "SELECT [Id],[Title],[State] FROM WorkItems WHERE [State] = 'Active'"
```

---

## Service Connections (Endpoints)

```bash
az devops service-endpoint list --project {project}
az devops service-endpoint show --id {endpoint-id}
az devops service-endpoint delete --id {id} --yes

# GitHub service connection
az devops service-endpoint github create \
  --github-url https://github.com/{org}/{repo} \
  --name my-github-connection
```

---

## Variable Groups

```bash
az pipelines variable-group list --project {project}
az pipelines variable-group show --id {id}
az pipelines variable-group create \
  --name my-vars \
  --variables KEY=value ANOTHER=val

az pipelines variable-group variable create \
  --group-id {id} --name MY_VAR --value secret --secret true
az pipelines variable-group variable update \
  --group-id {id} --name MY_VAR --value new-value
az pipelines variable-group variable delete \
  --group-id {id} --name MY_VAR --yes
```

---

## Environments & Approvals

```bash
az pipelines environment list --project {project}
az pipelines environment show --name {env-name}
az pipelines environment create --name {name} --project {project}
```

---

## Agent Pools & Agents

```bash
az pipelines agent pool list
az pipelines agent pool show --pool-id {id}
az pipelines agent list --pool-id {id}
az pipelines agent show --agent-id {id} --pool-id {pool-id}
```

---

## Artifacts / Feeds

```bash
az artifacts feed list --project {project}
az artifacts feed show --feed {feed-name}
az artifacts feed create --name {name} --project {project}
az artifacts universal download \
  --feed {feed} \
  --name {package-name} \
  --version {version} \
  --path ./output
az artifacts universal publish \
  --feed {feed} \
  --name {package-name} \
  --version {version} \
  --path ./dist
```

---

## Useful Flags

| Flag                                | Effect                                                |
| ----------------------------------- | ----------------------------------------------------- |
| `--output table`                    | Human-readable table output                           |
| `--output json`                     | Full JSON response                                    |
| `--query "..."`                     | JMESPath filter                                       |
| `--org https://dev.azure.com/{org}` | Override default org                                  |
| `--project {project}`               | Override default project                              |
| `--detect false`                    | Disable auto-detection of org/project from git remote |

---

## Common Patterns

```bash
# Get all active PR IDs in a repo
az repos pr list --status active --query "[].pullRequestId" -o tsv

# Trigger pipeline and wait for completion (polling)
az pipelines run --name {pipeline} --branch main --open

# List failed builds in last 24h
az pipelines build list --result failed --top 20

# Check pipeline YAML validity
az pipelines runs show --run-id {id}
```
