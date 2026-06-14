param(
    [string[]]$Site,
    [string]$SiteText = "",
    [switch]$OpenFolder
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$baseUrl = "https://j1nw31.github.io/winit_site_report/"
$outputDirectory = Join-Path $PSScriptRoot "qr"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$siteCodes = @()
$siteCodes += $Site
if (-not [string]::IsNullOrWhiteSpace($SiteText)) {
    $siteCodes += $SiteText -split '[,;\s]+'
}
$siteCodes = @(
    $siteCodes |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object { $_.Trim().ToUpperInvariant() } |
        Select-Object -Unique
)

if ($siteCodes.Count -eq 0) {
    throw "Enter at least one site code."
}

foreach ($normalizedSite in $siteCodes) {
    if ($normalizedSite -notmatch '^[A-Z]{2,6}\d{2,4}$') {
        throw "Invalid site code '$normalizedSite'. Example: LS01"
    }

    $reportUrl = "$baseUrl?site=$normalizedSite"
    $qrUrl = "https://quickchart.io/qr?text=" +
        [Uri]::EscapeDataString($reportUrl) +
        "&size=800&margin=3&dark=073d72&light=ffffff"
    $outputPath = Join-Path $outputDirectory "$normalizedSite.png"

    Invoke-WebRequest `
        -Uri $qrUrl `
        -OutFile $outputPath `
        -UseBasicParsing `
        -TimeoutSec 30

    Write-Host "$normalizedSite -> $outputPath" -ForegroundColor Green
    Write-Host "URL: $reportUrl"
}

if ($OpenFolder) {
    Start-Process explorer.exe -ArgumentList "`"$outputDirectory`""
}
