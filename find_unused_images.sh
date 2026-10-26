#!/bin/bash
# Find all files under assets/ or images/
all_files=$(find assets images -type f -not -path '*/.*')

# Get a list of all strings that look like paths to assets in the project
# We use a broad regex to catch assets in HTML, CSS, JS, JSON, etc.
# We strip quotes, parens, etc.
references=$(grep -rE "assets/[^\"')\s]+" . --exclude-dir={node_modules,.git,assets,images} -h -o | sort -u)

echo "Unreferenced assets:"
for file in $all_files; do
    if [[ ! "$references" =~ "$file" ]]; then
        echo "$file"
    fi
done
