$skills = @(
    @{ Name = "php-mcp-server-generator"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/php-mcp-server-generator/SKILL.md" },
    @{ Name = "typescript-mcp-server-generator"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/typescript-mcp-server-generator/SKILL.md" },
    @{ Name = "python-mcp-server-generator"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/python-mcp-server-generator/SKILL.md" },
    @{ Name = "javascript-typescript-jest"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/javascript-typescript-jest/SKILL.md" },
    @{ Name = "pytest-coverage"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/pytest-coverage/SKILL.md" },
    @{ Name = "postgresql-optimization"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/postgresql-optimization/SKILL.md" },
    @{ Name = "sql-optimization"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/sql-optimization/SKILL.md" },
    @{ Name = "multi-stage-dockerfile"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/multi-stage-dockerfile/SKILL.md" },
    @{ Name = "devops-rollout-plan"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/devops-rollout-plan/SKILL.md" },
    @{ Name = "git-commit"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/git-commit/SKILL.md" },
    @{ Name = "create-readme"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/create-readme/SKILL.md" },
    @{ Name = "create-specification"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/create-specification/SKILL.md" },
    @{ Name = "dotnet-upgrade"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/dotnet-upgrade/SKILL.md" },
    @{ Name = "web-coder"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/web-coder/SKILL.md" },
    @{ Name = "refactor"; Url = "https://raw.githubusercontent.com/github/awesome-copilot/main/skills/refactor/SKILL.md" }
)

$skillsDir = "skills"
if (!(Test-Path $skillsDir)) {
    New-Item -ItemType Directory -Path $skillsDir
}

foreach ($skill in $skills) {
    $skillDir = Join-Path $skillsDir $skill.Name
    if (!(Test-Path $skillDir)) {
        New-Item -ItemType Directory -Path $skillDir
    }
    $filePath = Join-Path $skillDir "SKILL.md"
    Invoke-WebRequest -Uri $skill.Url -OutFile $filePath
    Write-Host "Downloaded $($skill.Name) to $filePath"
}