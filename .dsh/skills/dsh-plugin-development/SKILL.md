---
name: dsh-plugin-development
description: "Trigger: create, modify, review, build, install DSH/Cordis plugins. Guide the host-only template and stop before unverified client/full-stack scope."
license: MIT
metadata:
  author: "JhonMA82"
  version: "1.0.0"
---

## Activation Contract

Load for create, modify, review, build, or install DSH/Cordis plugin tasks. Read only the task-mentioned file and direct dependencies. Decide scope first. When touching create-dsh-plugin.mjs, verify the current parser and selector in that file; do not assume a documented CLI option is implemented.

## Hard Rules

- Treat create-dsh-plugin.mjs as the source of truth for generated code, docs, this skill, and .gitignore.
- Keep package exports/files, dsh.bundle.patch, and cordis.patch.yml aligned. The patch is a top-level array; paths exist; id/name identify the package.
- The generator defaults to the host-only template and supports --template <name>, --template=<name>, and -t <name>; preserve explicit validation and clear errors when changing the parser.
- Full-stack is recognized but not generatable until a verified client/build contract exists; never invent React, client APIs, dependencies, tsdown, slots, or full-stack files.
- Local is a development/installation source (--patch, a local path, or Git), not a template.
- Host-only packages omit dsh.client and exports["./client"]; do not add React, JSX, slots, or client bundles.
- Host entries use named exports name, inject, and apply; do not add a default export.
- Own effects/resources with ctx.effect or a framework disposer; clean registrations, listeners, timers, routes, and services.
- Define tools with clear descriptions, parameter schemas, output schema/rendering, failure and side-effect contracts.
- Use project-relative manifest/route paths; never emit machine-specific absolute paths.

## Decision Gates

| Scope | Action |
| --- | --- |
| Host-only | Use tools, services, prompts, HTTP, or persistence without browser UI; keep the host package only. |
| Client/full-stack | Stop and report the blocker until a verified client/build contract exists; do not add client manifests/exports, React, slots, or browser build files. |
| Local source | Use --patch, a local path, or Git independently of the selected template. |

## Execution Steps

1. Check status; read the mentioned file and direct dependencies; choose scope.
2. For generator changes, check parsing and unsupported-template failures before prompting or creating a directory.
3. Make the smallest change. Update create-dsh-plugin.mjs first, then mirror generated code, docs, skill, and gitignore.
4. If dependencies exist, run pnpm run typecheck and pnpm run build; do not invent scripts or install dependencies just to verify.
5. In a temporary directory, run node --check create-dsh-plugin.mjs and generate a project. If DSH is available, run npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh plugin --profile scratch add . and npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh --profile scratch --dump-config.

## Output Contract

Report scope, files changed, exact verification results, pending checks, and risks. Do not commit or push unless explicitly requested.

## References

- ../../../AGENTS.md
- ../../../README.md
