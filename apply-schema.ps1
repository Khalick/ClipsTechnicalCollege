# Load environment variables
$envFile = Get-Content .env.local
foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
    }
}

# Get Supabase configuration
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Host "Error: Missing Supabase configuration in .env.local" -ForegroundColor Red
    exit 1
}

# Extract project ID from URL
$supabaseUrl -match 'https://([^.]+)\.supabase\.co'
$projectId = $matches[1]

# Construct connection string
$connectionString = "postgresql://postgres.$projectId" + ":" + $supabaseServiceKey + "@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

Write-Host "Applying schema to Supabase..." -ForegroundColor Green

# Apply schema
try {
    psql $connectionString -f "scripts/supabase-schema.sql"
    Write-Host "Schema applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error applying schema: $_" -ForegroundColor Red
    exit 1
}
