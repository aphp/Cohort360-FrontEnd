#!/bin/bash

export VERSION=$(cat package.json | grep version | head -1 | awk -F= "{ print $2 }" | sed 's/"version"://g' | sed 's/[",]//g' | tr -d '[[:space:]]')
export CI_COMMIT_SHORT_SHA=$(git rev-parse --short HEAD) 
echo "{\"commit\": \"$CI_COMMIT_SHORT_SHA\", \"version\": \"$VERSION\"}" > src/data/version.json