$ErrorActionPreference = "Stop"

# DONAC Part 2
# Adds missing cocktails to the EXISTING data/cocktails.json.
# It does not replace cocktails that are already there.
# Uses a delay + retry for HTTP 429 rate limiting.

$names = @(
"Paper Plane","Jungle Bird","Naked and Famous","Brandy Crusta","Corpse Reviver #2",
"Hanky Panky","Horse's Neck","Lemon Drop Martini","Planter's Punch","Rusty Nail",
"Sazerac","Stinger","Tuxedo","Vieux Carre","Tommy's Margarita","South Side",
"Bee's Knees","Bramble","Pornstar Martini","Russian Spring Punch","Suffering Bastard",
"Trinidad Sour","Tipperary","Three Dots and a Dash","Chartreuse Swizzle","Canchanchara",
"Missionary's Downfall","Don's Special Daiquiri","Illegal","Spicy Fifty","Sherry Cobbler",
"Pisco Punch","Rabo de Galo","Martinez","Godfather","Godmother","Rob Roy","Mint Julep",
"Mimosa","Gimlet","Gin and Tonic","Vodka Tonic","Rum Sour","Amaretto Sour",
"Blue Lagoon","Hurricane","Rum Runner","Bay Breeze","Cape Codder","Screwdriver",
"Harvey Wallbanger"
)

function Slug([string]$x) {
    (($x.ToLowerInvariant() -replace "[’']","") -replace "[^a-z0-9]+","-").Trim("-")
}

function Category($ings) {
    $t = (($ings | ForEach-Object {$_.name}) -join " ").ToLowerInvariant()
    if ($t -match "\bgin\b") {"gin"}
    elseif ($t -match "\bvodka\b") {"vodka"}
    elseif ($t -match "tequila|mezcal") {"tequila"}
    elseif ($t -match "\brum\b") {"rum"}
    elseif ($t -match "whiskey|whisky|bourbon|rye") {"whiskey"}
    elseif ($t -match "brandy|cognac|pisco") {"brandy"}
    elseif ($t -match "champagne|prosecco|sparkling") {"sparkling"}
    elseif ($t -match "aperol|campari|vermouth|amaro") {"aperitif"}
    else {"other"}
}

function Get-DrinkWithRetry([string]$name) {
    $encoded = [System.Uri]::EscapeDataString($name)
    $url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=$encoded"

    for ($attempt = 1; $attempt -le 5; $attempt++) {
        try {
            return Invoke-RestMethod -Uri $url -Method Get
        }
        catch {
            $msg = $_.Exception.Message

            if ($msg -match "429") {
                $wait = 20 * $attempt
                Write-Host "RATE LIMIT: $name - waiting $wait seconds..."
                Start-Sleep -Seconds $wait
                continue
            }

            throw
        }
    }

    return $null
}

$dataDir = Join-Path $PSScriptRoot "data"
$out = Join-Path $dataDir "cocktails.json"

if (-not (Test-Path $out)) {
    throw "data/cocktails.json was not found. Run this script from the main DONAC folder."
}

# Read existing database.
$existing = @(Get-Content -Raw -Path $out | ConvertFrom-Json)

if ($existing.Count -eq 0) {
    throw "Existing cocktails.json is empty."
}

# Safety backup before adding anything.
$backup = Join-Path $dataDir "cocktails-before-part2.json"
Copy-Item $out $backup -Force

$all = [System.Collections.ArrayList]::new()
foreach ($c in $existing) { [void]$all.Add($c) }

$existingNames = @{}
foreach ($c in $existing) {
    $existingNames[$c.name.ToLowerInvariant()] = $true
}

$added = 0
$notFound = @()
$failed = @()

Write-Host ""
Write-Host "DONAC PART 2"
Write-Host "Existing cocktails: $($existing.Count)"
Write-Host "Backup: data/cocktails-before-part2.json"
Write-Host ""

foreach ($name in $names) {
    if ($existingNames.ContainsKey($name.ToLowerInvariant())) {
        Write-Host "SKIP (already exists): $name"
        continue
    }

    try {
        $r = Get-DrinkWithRetry $name

        if ($null -eq $r -or -not $r.drinks) {
            $notFound += $name
            Write-Host "NOT FOUND: $name"
            Start-Sleep -Seconds 3
            continue
        }

        $drinks = @($r.drinks)
        $d = $drinks | Where-Object { $_.strDrink -ieq $name } | Select-Object -First 1
        if ($null -eq $d) { $d = $drinks[0] }

        # Prevent accidental duplicate if API returned a differently searched record.
        if ($existingNames.ContainsKey(([string]$d.strDrink).ToLowerInvariant())) {
            Write-Host "SKIP (API duplicate): $($d.strDrink)"
            Start-Sleep -Seconds 3
            continue
        }

        $ings = @()
        for ($i=1; $i -le 15; $i++) {
            $ip = $d.PSObject.Properties["strIngredient$i"]
            $mp = $d.PSObject.Properties["strMeasure$i"]

            $ing = if ($null -ne $ip) { [string]$ip.Value } else { "" }
            $measure = if ($null -ne $mp) { [string]$mp.Value } else { "" }

            if (-not [string]::IsNullOrWhiteSpace($ing)) {
                $ings += [ordered]@{
                    name = $ing.Trim()
                    amount = $(if ([string]::IsNullOrWhiteSpace($measure)) {"To taste"} else {$measure.Trim()})
                }
            }
        }

        $cat = Category $ings
        $instructions = [string]$d.strInstructions

        $method = if (-not [string]::IsNullOrWhiteSpace($instructions)) {
            @($instructions -split "(?<=[.!?])\s+" |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
                ForEach-Object { $_.Trim() })
        } else {
            @("Prepare and serve according to the recipe.")
        }

        $tags = @($cat)
        if ($d.strIBA) { $tags += "classic" }

        $record = [ordered]@{
            id = Slug ([string]$d.strDrink)
            name = [string]$d.strDrink
            category = $cat
            difficulty = $(if ($ings.Count -le 4) {"Easy"} else {"Medium"})
            time = $(if ($ings.Count -le 4) {5} else {10})
            glass = $(if ($d.strGlass) {[string]$d.strGlass} else {"Cocktail glass"})
            description = "A $cat cocktail with a distinctive character."
            garnish = "As desired"
            tags = $tags
            image = [string]$d.strDrinkThumb
            imageSource = "TheCocktailDB"
            featured = $false
            popular = $false
            ingredients = $ings
            method = $method
        }

        [void]$all.Add([pscustomobject]$record)
        $existingNames[([string]$d.strDrink).ToLowerInvariant()] = $true
        $added++

        # Save after EVERY successful addition.
        # If rate limiting or another error occurs later, progress is preserved.
        $all | ConvertTo-Json -Depth 10 | Set-Content -Path $out -Encoding UTF8

        Write-Host "ADDED: $($d.strDrink)   [TOTAL: $($all.Count)]"

        # Intentionally slow to avoid hammering the API.
        Start-Sleep -Seconds 4
    }
    catch {
        $failed += $name
        Write-Host "ERROR: $name"
        Write-Host "       $($_.Exception.Message)"
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "======================================"
Write-Host "PART 2 FINISHED"
Write-Host "STARTED WITH: $($existing.Count)"
Write-Host "ADDED:        $added"
Write-Host "TOTAL NOW:    $($all.Count)"
Write-Host "NOT FOUND:    $($notFound.Count)"
Write-Host "FAILED:       $($failed.Count)"
Write-Host "======================================"

if ($notFound.Count -gt 0) {
    Write-Host ""
    Write-Host "Not found:"
    $notFound | ForEach-Object { Write-Host " - $_" }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed:"
    $failed | ForEach-Object { Write-Host " - $_" }
}
