#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Build web app with deployment configuration
yarn build

yarn serve -s build