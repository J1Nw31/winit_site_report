param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z]{2,6}\d{2,4}$')]
    [string[]]$Site
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$baseUrl = "https://j1nw31.github.io/winit_site_report/"
$outputDirectory = Join-Path $PSScriptRoot "qr"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

foreach ($siteCode in $Site) {
    $normalizedSite = $siteCode.ToUpperInvariant()
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
