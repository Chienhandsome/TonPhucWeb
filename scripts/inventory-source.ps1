param([string]$OutputDirectory = 'docs/source-audit')

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$output = [IO.Path]::GetFullPath((Join-Path $root $OutputDirectory))
if (-not $output.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Output must stay inside the project.'
}
New-Item -ItemType Directory -Force -Path $output | Out-Null
$paths = @('/', '/gioi-thieu', '/gas-lanh', '/gas-lanh-r134a-floron-xuat-xu-an-do-chinh-hang', '/tin-tuc', '/dai-ly-phan-phoi-gas-lanh-hang-dau-viet-nam', '/lien-he')
$pages = @()
$links = @()
foreach ($path in $paths) {
    $url = 'https://tonphuc.com' + $path
    $file = if ($path -eq '/') { 'home.html' } else { $path.Trim('/') + '.html' }
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 30 -UseBasicParsing
        $html = $response.Content
        [IO.File]::WriteAllText((Join-Path $output $file), $html, [Text.UTF8Encoding]::new($false))
        $titleMatch = [regex]::Match($html, '(?is)<title[^>]*>(.*?)</title>')
        $pages += [pscustomobject]@{ url = $url; status = [int]$response.StatusCode; title = [Net.WebUtility]::HtmlDecode($titleMatch.Groups[1].Value.Trim()); snapshot = $file; fetched_at = [DateTimeOffset]::UtcNow.ToString('o') }
        foreach ($match in [regex]::Matches($html, '(?is)<a\b[^>]*href\s*=\s*["'']([^"'']+)["''][^>]*>(.*?)</a>')) {
            $href = [Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
            $resolved = $null
            if ([Uri]::TryCreate([Uri]$url, $href, [ref]$resolved) -and $resolved.Host -in @('tonphuc.com', 'www.tonphuc.com') -and $resolved.Scheme -in @('http', 'https')) {
                $label = [Net.WebUtility]::HtmlDecode(([regex]::Replace($match.Groups[2].Value, '(?is)<[^>]+>', ' ')))
                $links += [pscustomobject]@{ source = $url; url = $resolved.GetLeftPart([UriPartial]::Path) + $resolved.Query; label = [regex]::Replace($label, '\s+', ' ').Trim(); status = 'discovered-not-verified' }
            }
        }
    } catch {
        $pages += [pscustomobject]@{ url = $url; status = 'failed'; error = $_.Exception.Message }
    }
}
$pages | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $output 'pages.json') -Encoding utf8
$links | Sort-Object url, source -Unique | Export-Csv -LiteralPath (Join-Path $output 'links.csv') -NoTypeInformation -Encoding utf8
$failed = @($pages | Where-Object { $_.status -eq 'failed' }).Count
Write-Output "Saved $($pages.Count - $failed)/$($paths.Count) page samples and $(@($links.url | Sort-Object -Unique).Count) unique discovered URLs."
if ($failed -gt 0) { throw "$failed page samples failed; inspect pages.json." }
