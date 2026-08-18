/**
 * Post-install patch for @react-native/codegen so React Native 0.86's
 * `Readonly<>` / `ReadonlyArray<>` utility types are accepted as aliases for
 * Flow's `$ReadOnly<>` / `$ReadOnlyArray<>`.
 *
 * This script runs from the example app's postinstall hook and patches the
 * @react-native/codegen copy that Metro actually resolves, whether it lives in
 * the parent workspace node_modules or the example's own node_modules.
 */

const fs = require('fs');
const path = require('path');

const parentDir = path.join(__dirname, '..', '..');

function resolveCodegenDir() {
  try {
    const pkgJson = require.resolve('@react-native/codegen/package.json', {
      paths: [parentDir, __dirname],
    });
    return path.dirname(pkgJson);
  } catch {
    return null;
  }
}

const codegenDir = resolveCodegenDir();
if (!codegenDir) {
  console.log(
    '[patch-codegen-readonly] @react-native/codegen not found, skipping'
  );
  process.exit(0);
}

const parserPath = path.join(codegenDir, 'lib', 'parsers', 'flow', 'parser.js');
const componentsUtilsPath = path.join(
  codegenDir,
  'lib',
  'parsers',
  'flow',
  'components',
  'componentsUtils.js'
);

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-codegen-readonly] skip: ${filePath} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const {search, replace, alreadyPatched} of patches) {
    if (alreadyPatched && alreadyPatched(content)) {
      console.log(
        `[patch-codegen-readonly] already patched: ${path.basename(filePath)}`
      );
      continue;
    }
    if (content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
      console.log(
        `[patch-codegen-readonly] patched: ${path.basename(filePath)}`
      );
    } else {
      console.log(
        `[patch-codegen-readonly] pattern not found in ${path.basename(
          filePath
        )}, skipping`
      );
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

patchFile(parserPath, [
  {
    search: `module.exports = {
  FlowParser,
};`,
    replace: `const originalGetTypeAnnotationName =
  FlowParser.prototype.getTypeAnnotationName;
FlowParser.prototype.getTypeAnnotationName = function (typeAnnotation) {
  const name = originalGetTypeAnnotationName.call(this, typeAnnotation);
  if (name === 'ReadonlyArray') {
    return '$ReadOnlyArray';
  }
  if (name === 'Readonly') {
    return '$ReadOnly';
  }
  return name;
};

module.exports = {
  FlowParser,
};`,
    alreadyPatched: content =>
      content.includes(
        'FlowParser.prototype.getTypeAnnotationName = function'
      ),
  },
]);

patchFile(componentsUtilsPath, [
  {
    search: `    if (objectType.id.name === '$ReadOnly') {`,
    replace: `    if (
      objectType.id.name === '$ReadOnly' ||
      objectType.id.name === 'Readonly'
    ) {`,
    alreadyPatched: content =>
      content.includes("objectType.id.name === 'Readonly'"),
  },
  {
    search: `    if (objectType.id.name === '$ReadOnlyArray') {`,
    replace: `    if (
      objectType.id.name === '$ReadOnlyArray' ||
      objectType.id.name === 'ReadonlyArray'
    ) {`,
    alreadyPatched: content =>
      content.includes("objectType.id.name === 'ReadonlyArray'"),
  },
]);
