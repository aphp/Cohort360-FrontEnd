#!/usr/bin/env bash
# Usage : pr-target-guard.sh pending|check
# Env : GH_TOKEN, REPO, PR_NUMBER
set -euo pipefail

marker='<!-- pr-target-guard -->'
pending_line='_🔄 Vérification en cours, ce commentaire va être mis à jour._'

comment=$(gh api --paginate "repos/$REPO/issues/$PR_NUMBER/comments" \
  --jq ".[] | select(.user.login == \"github-actions[bot]\" and (.body | startswith(\"$marker\")))" | jq -s 'first // empty')
comment_id=$(jq -r '.id // empty' <<<"$comment")
comment_body=$(jq -r '.body // empty' <<<"$comment")

if [ "$1" = pending ]; then
  if [ -n "$comment_id" ] && ! grep -qF "$pending_line" <<<"$comment_body"; then
    body="$marker"$'\n'"$pending_line"$'\n'"${comment_body#"$marker"$'\n'}"
    gh api -X PATCH "repos/$REPO/issues/comments/$comment_id" -f body="$body" >/dev/null \
      || echo "::warning::Commentaire de la garde non mis à jour."
  fi
  exit 0
fi

# Lus sur la PR et non dans l'événement : les labels ont pu changer pendant la CI.
pr=$(gh api "repos/$REPO/pulls/$PR_NUMBER")
base_ref=$(jq -r '.base.ref' <<<"$pr")
head_ref=$(jq -r '.head.ref' <<<"$pr")
labels=$(jq -c '[.labels[].name]' <<<"$pr")
errors=()

if [ "$base_ref" = main ]; then
  case "$head_ref" in
    hotfix/*|release/*) ;;
    *) errors+=("Seules les branches \`hotfix/**\` ou \`release/**\` peuvent cibler \`main\` (reçu : \`$head_ref\`).") ;;
  esac
fi

if jq -e 'any(.[]; ascii_upcase == "DO NOT MERGE")' <<<"$labels" >/dev/null; then
  errors+=("Le label \`DO NOT MERGE\` est posé.")
fi

# BC3.3 -> feature/bc-3.3
mapfile -t bc_labels < <(jq -r '.[] | select(test("^BC"; "i"))' <<<"$labels")
if [ "${#bc_labels[@]}" -gt 1 ]; then
  errors+=("Plusieurs labels BC sont posés (${bc_labels[*]}), il n'en faut qu'un.")
elif [ "${#bc_labels[@]}" -eq 1 ]; then
  expected=$(jq -rn --arg l "${bc_labels[0]}" '$l | ascii_downcase | sub("^bc[ -]*"; "feature/bc-")')
  if [ "$base_ref" != "$expected" ]; then
    errors+=("Le label \`${bc_labels[0]}\` impose de cibler \`$expected\` (reçu : \`$base_ref\`).")
  fi
fi

if [ "${#errors[@]}" -eq 0 ]; then
  if [ -n "$comment_id" ]; then
    gh api -X DELETE "repos/$REPO/issues/comments/$comment_id" \
      || echo "::warning::Commentaire de la garde non supprimé."
  fi
  echo "PR target OK"
  exit 0
fi

body="$marker"$'\n'"**Cette PR ne peut pas être mergée :**"$'\n'
for e in "${errors[@]}"; do
  body+=$'\n'"- $e"
  echo "::error title=PR bloquée::$e"
done

if [ -n "$comment_id" ]; then
  gh api -X PATCH "repos/$REPO/issues/comments/$comment_id" -f body="$body" >/dev/null \
    || echo "::warning::Commentaire de la garde non mis à jour."
else
  gh api "repos/$REPO/issues/$PR_NUMBER/comments" -f body="$body" >/dev/null \
    || echo "::warning::Commentaire de la garde non posé."
fi
exit 1
