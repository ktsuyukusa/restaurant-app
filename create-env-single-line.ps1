# Create .env file with single-line environment variables
$envFile = ".env"

# Write each variable on a separate line
"VITE_SUPABASE_URL=https://mzmvlahjtybrdboteyry.supabase.co" | Out-File -FilePath $envFile -Encoding UTF8
"VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bXZsYWhqdHlicmRib3RleXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTY2ODEsImV4cCI6MjA2ODAzMjY4MX0.95zziILtcMnzvCwKz4HoWeeFSfqlQSbe_afdTl97VVmA" | Add-Content -Path $envFile -Encoding UTF8
"VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51HEPeKHDciAfHF4XWMChPT07lSjGrbNhz2ZWhqKszcdG2BOwyZbRHRdYkMKg3OoAGAyIztd3yxY5BMHP7itw8FMd00BRBijcCL" | Add-Content -Path $envFile -Encoding UTF8
"VITE_APP_NAME=Navikko" | Add-Content -Path $envFile -Encoding UTF8
"VITE_DEFAULT_LATITUDE=36.2342" | Add-Content -Path $envFile -Encoding UTF8
"VITE_DEFAULT_LONGITUDE=138.4792" | Add-Content -Path $envFile -Encoding UTF8
"VITE_MAP_BBOX_OFFSET=0.02" | Add-Content -Path $envFile -Encoding UTF8

Write-Host ".env file created successfully with single-line variables!" 