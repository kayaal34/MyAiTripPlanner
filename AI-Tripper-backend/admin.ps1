param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsList
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = "c:/Users/yahya/MyAiTripPlanner/.venv/Scripts/python.exe"

if (-not (Test-Path $python)) {
    Write-Error "Python environment not found at $python"
    exit 1
}

Push-Location $root
try {
    & $python "./admin_panel.py" @ArgsList
}
finally {
    Pop-Location
}
