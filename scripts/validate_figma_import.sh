#!/usr/bin/env bash
set -euo pipefail

fail_count=0

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  fail_count=$((fail_count + 1))
}

is_text_file() {
  local file_path="$1"
  grep -Iq . "$file_path"
}

collect_changed_files() {
  local base="${BASE_SHA:-}"
  local head="${HEAD_SHA:-}"

  if [[ -n "$head" && "$head" != "0000000000000000000000000000000000000000" ]] && git cat-file -e "${head}^{commit}" 2>/dev/null; then
    if [[ -n "$base" && "$base" != "0000000000000000000000000000000000000000" ]] && git cat-file -e "${base}^{commit}" 2>/dev/null; then
      git diff --name-only "$base" "$head"
      return
    fi

    git diff-tree --no-commit-id --name-only -r "$head"
    return
  fi

  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    git diff --name-only HEAD~1 HEAD
  else
    git ls-files
  fi
}

mapfile -t changed_files < <(collect_changed_files | sed '/^[[:space:]]*$/d' | sort -u)

if [[ ${#changed_files[@]} -eq 0 ]]; then
  log "No changed files detected."
  exit 0
fi

log "Validating ${#changed_files[@]} changed file(s)..."

branch_name="${BRANCH_NAME:-}"
is_figma_drop=false
if [[ "$branch_name" == figma-drop/* ]]; then
  is_figma_drop=true
fi

max_file_bytes="${MAX_FILE_BYTES:-1500000}"
max_image_bytes="${MAX_IMAGE_BYTES:-4000000}"
secret_regex='(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_DB_PASSWORD|sb_secret_[A-Za-z0-9_]+|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH|DSA|PRIVATE) KEY-----|xox[baprs]-[A-Za-z0-9-]+)'

for path in "${changed_files[@]}"; do
  if [[ -z "$path" ]]; then
    continue
  fi

  if [[ "$path" == ".env.example" || "$path" == */".env.example" ]]; then
    :
  elif [[ "$path" == ".env" || "$path" == */".env" || "$path" == .env.* || "$path" == */.env.* || "$path" == *.pem || "$path" == *.key || "$path" == *.p12 || "$path" == *.pfx || "$path" == *id_rsa* || "$path" == *".DS_Store" || "$path" == node_modules/* || "$path" == */node_modules/* ]]; then
    fail "Disallowed file pattern in change set: $path"
  fi

  if $is_figma_drop; then
    if [[ "$path" == .github/workflows/* || "$path" == scripts/validate_figma_import.sh || "$path" == docs/FIGMA_PUSH_FAILSAFE.md ]]; then
      fail "Protected control file modified from figma-drop branch: $path"
    fi
  fi

  if [[ ! -e "$path" ]]; then
    continue
  fi

  size_bytes=$(wc -c <"$path")
  if [[ "$size_bytes" -gt "$max_file_bytes" ]]; then
    if [[ "$path" == *.png || "$path" == *.jpg || "$path" == *.jpeg || "$path" == *.webp || "$path" == *.gif || "$path" == *.avif || "$path" == *.svg ]]; then
      if [[ "$size_bytes" -le "$max_image_bytes" ]]; then
        :
      else
        fail "Image exceeds size budget (${size_bytes} > ${max_image_bytes} bytes): $path"
      fi
    else
      fail "File exceeds size budget (${size_bytes} > ${max_file_bytes} bytes): $path"
    fi
  fi

  if ! is_text_file "$path"; then
    continue
  fi

  if grep -nE '^(<<<<<<<|=======|>>>>>>>)' "$path" >/tmp/conflict_markers.out 2>/dev/null; then
    fail "Merge conflict marker found in $path"
    cat /tmp/conflict_markers.out
  fi

  if grep -nE "$secret_regex" "$path" >/tmp/secret_hits.out 2>/dev/null; then
    fail "Potential secret detected in $path"
    cat /tmp/secret_hits.out
  fi
done

if [[ "$fail_count" -gt 0 ]]; then
  log "Validation failed with ${fail_count} error(s)."
  exit 1
fi

log "Figma import validation passed."
