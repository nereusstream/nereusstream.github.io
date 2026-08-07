import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import YAML from 'yaml';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const fullCommitPattern = /^[0-9a-f]{40}$/;
export const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function absolutePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function relativePath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

export function readText(relativeFilePath) {
  return fs.readFileSync(absolutePath(relativeFilePath), 'utf8');
}

export function readYaml(relativeFilePath) {
  return YAML.parse(readText(relativeFilePath)) ?? {};
}

export function walkFiles(relativeDirectory, extensions = new Set(['.md', '.mdx'])) {
  const directory = absolutePath(relativeDirectory);
  const files = [];

  function visit(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      const currentPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(currentPath);
      } else if (extensions.has(path.extname(entry.name))) {
        files.push(relativePath(currentPath));
      }
    }
  }

  visit(directory);
  return files;
}

export function parseFrontmatter(relativeFilePath) {
  const text = readText(relativeFilePath);
  if (!text.startsWith('---\n')) {
    throw new Error(`${relativeFilePath}: missing YAML frontmatter`);
  }

  const closingMarker = text.indexOf('\n---', 4);
  if (closingMarker < 0) {
    throw new Error(`${relativeFilePath}: unterminated YAML frontmatter`);
  }

  const frontmatter = YAML.parse(text.slice(4, closingMarker)) ?? {};
  return {data: frontmatter, body: text.slice(closingMarker + 4)};
}

export function collectStrings(value, output = []) {
  if (typeof value === 'string') {
    output.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, output);
    }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectStrings(item, output);
    }
  }
  return output;
}

export function collectMapTargets(map, prefix) {
  return new Set(collectStrings(map).filter((value) => value.startsWith(`${prefix}/`)));
}

export function docRoute(relativeFilePath) {
  const withoutExtension = relativeFilePath.replace(/\.(md|mdx)$/, '');
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -'/index'.length)}/`;
  }
  return `/${withoutExtension}/`;
}

export function assertCondition(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

export function finishCheck(name, errors) {
  if (errors.length > 0) {
    console.error(`${name} failed:`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`${name}: passed`);
}
