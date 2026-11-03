#!/usr/bin/env bash
# ProtoWiki Wikimedia API User-Agent — keep in sync with src/api-user-agent.txt
set -euo pipefail

_API_UA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_API_UA_FILE="${_API_UA_DIR}/../src/api-user-agent.txt"

if [[ ! -f "${_API_UA_FILE}" ]]; then
  echo "api-user-agent.sh: missing ${_API_UA_FILE}" >&2
  exit 1
fi

PROTOWIKI_API_USER_AGENT="$(tr -d '\n\r' < "${_API_UA_FILE}")"
export PROTOWIKI_API_USER_AGENT
