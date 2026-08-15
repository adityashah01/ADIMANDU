const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "src");
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function scanFolder(folder) {
    for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
        const fullPath = path.join(folder, item.name);

        if (item.isDirectory()) {
            scanFolder(fullPath);
            continue;
        }

        if (!EXTENSIONS.has(path.extname(item.name))) {
            continue;
        }

        const code = fs.readFileSync(fullPath, "utf8");

        // Find input, textarea and select opening tags.
        const tagRegex = /<(input|textarea|select)\b[\s\S]*?>/g;

        let match;

        while ((match = tagRegex.exec(code)) !== null) {
            const tag = match[0];

            const hasValue = /\bvalue\s*=/.test(tag);
            const hasOnChange = /\bonChange\s*=/.test(tag);
            const hasReadOnly = /\breadOnly\b/.test(tag);
            const hasDefaultValue = /\bdefaultValue\s*=/.test(tag);

            if (
                hasValue &&
                !hasOnChange &&
                !hasReadOnly &&
                !hasDefaultValue
            ) {
                const line =
                    code.slice(0, match.index).split("\n").length;

                console.log("\nPossible problem found:");
                console.log(`${fullPath}:${line}`);
                console.log(tag);
            }
        }
    }
}

console.log("Searching for controlled fields without onChange...");
scanFolder(ROOT);
console.log("\nSearch completed.");