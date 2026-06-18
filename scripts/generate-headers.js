const fs = require('fs');
const path = require('path');

const README_PATH = path.join(process.cwd(), 'README.md');
const SRC_DIR = path.join(process.cwd(), 'src');
const TEMPLATE_PATH = path.join(process.cwd(), 'src', 'heading.svg');

const readme = fs.readFileSync(README_PATH, 'utf8');
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

if (!fs.existsSync(SRC_DIR)) {
	fs.mkdirSync(SRC_DIR, { recursive: true });
}

/**
 * Core regex (single source of truth)
 */
const REGEX_CORE =
    '(?<file>(?<text>(?!-)(?:[a-z0-9]+-?)+(?<!-))-(?<color>[a-f0-9]{3}(?:[a-f0-9]{3})?)\\.svg)';

/**
 * Derived regexes
 */
const readmeRegex = new RegExp(`"([a-z]+\\/)*src\\/${REGEX_CORE}"`, 'g');
const fileRegex = new RegExp(`^${REGEX_CORE}$`);

/**
 * ----------------------------
 * 1. referencedFiles (from README)
 * ----------------------------
 */
const referencedFiles = new Set();

let match;

while ((match = readmeRegex.exec(readme)) !== null) {
	const { file } = match.groups;
	referencedFiles.add(file);
}

/**
 * ----------------------------
 * 2. existingFiles (from src root only, regex validated)
 * ----------------------------
 */
const existingFiles = new Set();

for (const file of fs.readdirSync(SRC_DIR)) {
	const match = file.match(fileRegex);
	if (!match) continue;

	const { file: validFile } = match.groups;
	existingFiles.add(validFile);
}

/**
 * ----------------------------
 * 3. Create missing files (README − src)
 * ----------------------------
 */
for (const file of referencedFiles) {
	if (existingFiles.has(file)) continue;

	const match = file.match(fileRegex);
	if (!match) continue;

	const { text, color } = match.groups;

	const label = text.replace(/-/g, ' ').toUpperCase();

	const svg = template
		.replaceAll('{{COLOR}}', color)
		.replaceAll('{{LABEL}}', label);

	const outputPath = path.join(SRC_DIR, file);

	fs.writeFileSync(outputPath, svg, 'utf8');
	console.log(`Generated ${file}`);
}

/**
 * ----------------------------
 * 4. Delete unused files (from src root only, regex validated)
 * ----------------------------
 */
for (const file of existingFiles) {
	if (!referencedFiles.has(file)) {
		fs.unlinkSync(path.join(SRC_DIR, file));
		console.log(`Deleted ${file}`);
	}
}
