#!/bin/bash
# monitor-version.sh
# TeleMedCare V12 - Anti-Rollback Monitor
# Checks every 5 minutes if system has rolled back to V11

set -euo pipefail

# Configuration
BASE_URL="https://telemedcare-v12.pages.dev"
EXPECTED_VERSION="V12"
EXPECTED_COMMIT="033b5c7"
CHECK_INTERVAL=300  # 5 minutes
LOG_FILE="/home/user/webapp/monitor-version.log"
MAX_LOG_SIZE=10485760  # 10MB

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log rotation
rotate_log() {
  if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    echo "Log rotated at $(date -u +"%Y-%m-%d %H:%M:%S UTC")" > "$LOG_FILE"
  fi
}

# Log function
log() {
  local level="$1"
  shift
  local message="$@"
  local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Alert function (can be extended with Slack, email, etc.)
send_alert() {
  local message="$1"
  log "ALERT" "$message"
  
  # TODO: Uncomment when configured
  # Send Slack notification
  # curl -X POST "$SLACK_WEBHOOK_URL" \
  #   -H 'Content-Type: application/json' \
  #   -d "{\"text\":\"🚨 TeleMedCare Alert: $message\"}"
  
  # Send email (if sendmail available)
  # echo "$message" | mail -s "🚨 TeleMedCare Alert" admin@example.com
}

# Check healthcheck endpoint
check_healthcheck() {
  local response=$(curl -s -w "\n%{http_code}" \
    -H "Cache-Control: no-cache, no-store, must-revalidate" \
    -H "Pragma: no-cache" \
    -H "X-Monitor-Check: true" \
    --max-time 10 \
    "${BASE_URL}/api/health" 2>&1 || echo "000")
  
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" != "200" ]; then
    log "ERROR" "Healthcheck failed with HTTP $http_code"
    return 1
  fi
  
  # Parse JSON response
  local version=$(echo "$body" | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  local commit=$(echo "$body" | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  local status=$(echo "$body" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  
  log "INFO" "Healthcheck: version=$version, commit=$commit, status=$status"
  
  # Check for rollback
  if [ "$version" != "$EXPECTED_VERSION" ]; then
    log "CRITICAL" "ROLLBACK DETECTED! Expected $EXPECTED_VERSION, got $version"
    send_alert "System rolled back from $EXPECTED_VERSION to $version!"
    return 2
  fi
  
  if [ "$status" != "healthy" ]; then
    log "WARNING" "System status is $status (not healthy)"
    return 3
  fi
  
  log "INFO" "System healthy: $EXPECTED_VERSION active"
  return 0
}

# Check critical pages
check_critical_pages() {
  local pages=(
    "/firma-contratto.html"
    "/dashboard.html"
    "/"
  )
  
  local failed_count=0
  
  for page in "${pages[@]}"; do
    local status=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Cache-Control: no-cache" \
      --max-time 10 \
      "${BASE_URL}${page}" 2>&1 || echo "000")
    
    if [ "$status" = "200" ]; then
      log "DEBUG" "Page ${page}: $status OK"
    elif [ "$status" = "308" ] || [ "$status" = "301" ]; then
      log "WARNING" "Page ${page}: $status (redirect)"
    else
      log "ERROR" "Page ${page}: $status FAILED"
      ((failed_count++))
    fi
  done
  
  if [ $failed_count -gt 0 ]; then
    log "WARNING" "$failed_count critical page(s) not accessible"
    return 1
  fi
  
  return 0
}

# Check for deployment lock
check_deploy_lock() {
  local status=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Cache-Control: no-cache" \
    --max-time 5 \
    "${BASE_URL}/DEPLOY_LOCK.json" 2>&1 || echo "000")
  
  if [ "$status" != "200" ]; then
    log "WARNING" "DEPLOY_LOCK.json not accessible (HTTP $status)"
    return 1
  fi
  
  log "INFO" "DEPLOY_LOCK.json present"
  return 0
}

# Main monitoring loop
main() {
  log "INFO" "=== TeleMedCare V12 Monitor Started ==="
  log "INFO" "Expected version: $EXPECTED_VERSION (commit $EXPECTED_COMMIT)"
  log "INFO" "Check interval: ${CHECK_INTERVAL}s"
  log "INFO" "Base URL: $BASE_URL"
  
  local check_count=0
  local error_count=0
  local rollback_count=0
  
  while true; do
    ((check_count++))
    rotate_log
    
    log "INFO" "--- Check #$check_count ---"
    
    # Run checks
    if check_healthcheck; then
      check_result="✅ HEALTHY"
      error_count=0  # Reset error counter on success
    else
      check_exit=$?
      if [ $check_exit -eq 2 ]; then
        check_result="🚨 ROLLBACK DETECTED"
        ((rollback_count++))
        ((error_count++))
        
        if [ $rollback_count -ge 3 ]; then
          send_alert "CRITICAL: System has rolled back $rollback_count times!"
        fi
      else
        check_result="❌ ERROR"
        ((error_count++))
      fi
    fi
    
    check_critical_pages || true
    check_deploy_lock || true
    
    log "INFO" "Check result: $check_result (errors: $error_count, rollbacks: $rollback_count)"
    
    # Alert if multiple consecutive errors
    if [ $error_count -ge 5 ]; then
      send_alert "System has $error_count consecutive errors!"
    fi
    
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Check #$check_count: $check_result"
    
    # Wait for next check
    sleep $CHECK_INTERVAL
  done
}

# Handle signals
trap 'log "INFO" "Monitor stopped"; exit 0' SIGINT SIGTERM

# Start monitoring
main
