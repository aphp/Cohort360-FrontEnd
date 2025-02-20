#!/bin/bash

set -e

# Exit if no version argument provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <version> <bump_type>"
    echo "bump_type must be either 'minor' or 'patch'"
    exit 1
fi

VERSION=$1
BUMP_TYPE=$2

if [ "$BUMP_TYPE" != "minor" ] && [ "$BUMP_TYPE" != "patch" ]; then
    echo "Error: bump_type must be either 'minor' or 'patch'"
    exit 1
fi

echo "Creating release commit for version $VERSION"

# Update version in package.json and package-lock.json
npm version $VERSION --no-git-tag-version

# Generate changelog and prepend to CHANGELOG.md
git fetch --tags # ensure all the tags are fetched
git cliff --bump $BUMP_TYPE --unreleased > temp_changelog.md
tail -n +4 CHANGELOG.md >> temp_changelog.md
mv temp_changelog.md CHANGELOG.md

echo "You can review the modification and then execute this command to commit and push the changes:"
echo "git add package.json package-lock.json CHANGELOG.md && git commit -m \"build: set release version $VERSION\" && git tag $VERSION && git push origin $VERSION && git push origin HEAD"

read -p "Would you like to automatically execute these commands? (y/N) " answer
if [ "$answer" = "y" ]; then
  # Add files and create commit
    git add package.json package-lock.json CHANGELOG.md
    git commit -m "build: set release version $VERSION"
    git tag $VERSION
    git push origin $VERSION
    git push origin HEAD
    echo "Release commit created and pushed successfully."
else
    echo "Release commit not created."
fi
