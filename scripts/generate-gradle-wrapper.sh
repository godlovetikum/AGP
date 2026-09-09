#!/usr/bin/env bash
set -euo pipefail

# Run this script from any directory. It intentionally regenerates the wrapper
# only when Gradle tooling is being upgraded; normal CI uses the committed JAR.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
: "${GRADLE_VERSION:=9.3.1}"
command -v gradle >/dev/null 2>&1 || { echo 'Gradle is required to regenerate the wrapper.' >&2; exit 1; }
cd android
gradle wrapper --gradle-version "$GRADLE_VERSION" --distribution-type bin
test -f gradle/wrapper/gradle-wrapper.jar
printf 'Generated android/gradle/wrapper/gradle-wrapper.jar for Gradle %s\n' "$GRADLE_VERSION"
