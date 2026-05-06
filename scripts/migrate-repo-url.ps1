$old = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
$new = "Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"

Get-ChildItem -Recurse -File -Exclude "_MIGRATION", ".git", "node_modules", "vendor", "dist", "build" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match $old) {
        $content = $content -replace [regex]::Escape($old), $new
        Set-Content $_.FullName $content -NoNewline
        Write-Host "Updated: $($_.FullName)"
    }
}
