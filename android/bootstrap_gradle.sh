#!/usr/bin/env bash
set -euo pipefail
BASE=$(dirname "$0")
curl -sL https://services.gradle.org/distributions/gradle-8.9-bin.zip -o "$BASE/gradle-8.9-bin.zip"
mkdir -p "$BASE/gradle"
unzip -q -o "$BASE/gradle-8.9-bin.zip" -d "$BASE/gradle"
rm -f "$BASE/gradle-8.9-bin.zip"
