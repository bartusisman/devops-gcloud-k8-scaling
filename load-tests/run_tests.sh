#!/usr/bin/env bash
set -euo pipefail

# ─────────────── CONFIG ───────────────
LOCUSTFILE="locustfile.py"
HOST="http://35.189.72.248"
NAMESPACE="default"
OUT_BASE="./tests"

# Define: scenario_id users spawn_rate duration
SCENARIOS=(
  "1 100   10   2m"
  "2 200   20   2m"
  "3 500   50   3m"
  "4 1000 100   5m"
)

# ─────────────── RUN ───────────────
for spec in "${SCENARIOS[@]}"; do
  read -r ID USERS RATE TIME <<<"$spec"
  DIR="${OUT_BASE}/${ID}"
  mkdir -p "$DIR"

  echo
  echo "▶ Scenario #$ID: $USERS users @ $RATE u/s for $TIME"
  echo "  • logs → $DIR"
  
  CPU_CSV="$DIR/cpu_usage.csv"
  # only timestamp, total_cpu_millicores, expected_pods
  echo "timestamp,total_cpu_millicores,expected_pods" >"$CPU_CSV"

  # background CPU logger
  (
    while true; do
      ts=$(date +%s)
      cpu=$(kubectl top pods -n "$NAMESPACE" --no-headers \
            | awk '{sum += $2} END {print sum}')
      # calculate expected pods: cpu/500 + 2, clamped [2..5]
      expected=$(( cpu / 500 + 2 ))
      if (( expected < 2 )); then
        expected=2
      elif (( expected > 5 )); then
        expected=5
      fi
      echo "$ts,$cpu,$expected" >>"$CPU_CSV"
      sleep 2
    done
  ) &
  CPU_PID=$!

  # run locust (don’t let one failure stop the loop)
  set +e
  locust -f "$LOCUSTFILE" \
    --host="$HOST" \
    --users "$USERS" \
    --spawn-rate "$RATE" \
    --run-time "$TIME" \
    --headless \
    --csv="$DIR/locust" \
    --only-summary
  set -e

  # stop CPU logger
  kill "$CPU_PID" &>/dev/null || true
done

echo
echo "✅ All scenarios complete. Results in $OUT_BASE/{1,2,3,4}"
