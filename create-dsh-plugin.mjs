#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'

const args = process.argv.slice(2)
const defaultTemplate = 'host-only'
const knownTemplates = ['host-only', 'full-stack']
const fullStackUnavailableMessage = 'The "full-stack" template is recognized but not available yet. It requires a verified client/build contract before it can be generated.'
const dshVersion = '0.1.2-alpha.2'
const dshToolsVersion = '0.1.2-alpha.2'
const cordisVersion = '4.0.2'
const safeSlugPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/
const helpText = `Usage:
  node ./create-dsh-plugin.mjs [options] [plugin-name]

Options:
  -t, --template <name>  Select a template.
      --template=<name>  Select a template.
  -h, --help             Show this help.

Templates:
  host-only              Available and the default. Generates the host package.
  full-stack             Recognized but unavailable until a client/build contract is verified.

Development and installation sources:
  local                  Not a template. Use --patch, a local path, or Git as the source.

Compatibility preview:
  Host/CLI: @deepseek-ai/dsh@${dshVersion}
  Tools:    @deepseek-ai/dsh-tools@${dshToolsVersion}
  Cordis:   @deepseek-ai/cordis@${cordisVersion}
  These are preview compatibility pins, not a stable DSH guarantee.
  Update this matrix when DSH publishes a new compatibility contract.

Examples:
  node ./create-dsh-plugin.mjs dsh-custom-tools
  node ./create-dsh-plugin.mjs --template host-only dsh-custom-tools
  node ./create-dsh-plugin.mjs --template=host-only dsh-custom-tools
  node ./create-dsh-plugin.mjs -t host-only dsh-custom-tools
`
const gitignoreContent = `node_modules/
dist/
.atl/
`
const dshPluginDevelopmentSkill = `---
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
5. In a temporary directory, run node --check create-dsh-plugin.mjs and generate a project. If DSH is available, run npx -p @deepseek-ai/dsh@${dshVersion} dsh plugin --profile scratch add . and npx -p @deepseek-ai/dsh@${dshVersion} dsh --profile scratch --dump-config.

## Output Contract

Report scope, files changed, exact verification results, pending checks, and risks. Do not commit or push unless explicitly requested.

## References

- ../../../AGENTS.md
- ../../../README.md
`

function parseArguments(argv) {
  let template = defaultTemplate
  let targetName
  let templateSelected = false
  let showHelp = false

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--help' || argument === '-h') {
      showHelp = true
      continue
    }

    if (argument === '--template' || argument === '-t') {
      if (templateSelected) {
        throw new Error('The --template option may be provided only once.')
      }

      const value = argv[index + 1]
      if (!value || value.startsWith('-')) {
        throw new Error(`Missing template value after ${JSON.stringify(argument)}.`)
      }

      template = value
      templateSelected = true
      index += 1
      continue
    }

    if (argument.startsWith('--template=')) {
      if (templateSelected) {
        throw new Error('The --template option may be provided only once.')
      }

      const value = argument.slice('--template='.length)
      if (!value) {
        throw new Error('Missing template value after --template=.')
      }

      template = value
      templateSelected = true
      continue
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown option ${JSON.stringify(argument)}. Use --help for usage.`)
    }

    if (targetName !== undefined) {
      throw new Error(`Plugin name may be provided only once; unexpected argument ${JSON.stringify(argument)}.`)
    }

    targetName = argument
  }

  if (!knownTemplates.includes(template)) {
    throw new Error(`Unknown template ${JSON.stringify(template)}. Choose one of: ${knownTemplates.join(', ')}.`)
  }

  return { showHelp, targetName, template }
}

function validateTargetName(name) {
  if (
    typeof name !== 'string' ||
    !name ||
    path.isAbsolute(name) ||
    name.includes('/') ||
    name.includes('\\') ||
    name.includes('..') ||
    /\s/.test(name) ||
    !safeSlugPattern.test(name)
  ) {
    throw new Error(
      `Invalid plugin name ${JSON.stringify(String(name))}. Use a lowercase slug with letters, numbers, '.', '_' or '-' only; paths, whitespace, and '..' are not allowed.`
    )
  }
}

function isPathInside(parentDir, childDir) {
  const relativePath = path.relative(parentDir, childDir)
  return Boolean(relativePath) &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
}

function createProjectDirectory(projectDir, name) {
  if (fs.existsSync(projectDir)) {
    throw new Error(`The destination ${JSON.stringify(name)} already exists.`)
  }

  try {
    fs.mkdirSync(projectDir)
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(`The destination ${JSON.stringify(name)} already exists.`)
    }
    throw error
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

async function run() {
  const { showHelp, targetName: parsedTargetName, template } = parseArguments(args)
  if (showHelp) {
    console.log(helpText)
    return
  }

  if (template === 'full-stack') {
    throw new Error(fullStackUnavailableMessage)
  }

  let targetName = parsedTargetName
  if (!targetName) {
    targetName = await askQuestion('Plugin name (e.g. dsh-custom-tools): ')
    targetName = targetName.trim()
    if (!targetName) targetName = 'dsh-my-plugin'
  }

  validateTargetName(targetName)

  const currentDir = process.cwd()
  const projectDir = path.resolve(currentDir, targetName)
  if (!isPathInside(currentDir, projectDir)) {
    throw new Error('The project destination must be below the current directory.')
  }

  const toolName = `${targetName.replace(/[._-]+/g, '_')}_greet`
  createProjectDirectory(projectDir, targetName)

  console.log(`\x1b[36mCreating plugin at:\x1b[0m ${projectDir}\n`)
  fs.mkdirSync(path.join(projectDir, 'src', 'tools'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'src', 'services'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, '.dsh', 'skills', 'dsh-plugin-development'), { recursive: true })

  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent)
  fs.writeFileSync(
    path.join(projectDir, '.dsh', 'skills', 'dsh-plugin-development', 'SKILL.md'),
    dshPluginDevelopmentSkill
  )

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
    name: targetName,
    version: '0.1.0',
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        default: './dist/index.js'
      },
      './cordis.patch.yml': './cordis.patch.yml',
      './package.json': './package.json'
    },
    files: ['dist', 'cordis.patch.yml', 'README.md'],
    engines: {
      node: '>=18'
    },
    scripts: {
      build: 'tsup src/index.ts --format esm --dts --clean',
      dev: 'tsup src/index.ts --format esm --watch',
      typecheck: 'tsc -p tsconfig.json --noEmit',
      prepare: 'npm run build'
    },
    dsh: { bundle: { patch: './cordis.patch.yml' } },
    peerDependencies: {
      '@deepseek-ai/cordis': cordisVersion,
      '@deepseek-ai/dsh-tools': dshToolsVersion
    },
    devDependencies: {
      '@deepseek-ai/cordis': cordisVersion,
      '@deepseek-ai/dsh-tools': dshToolsVersion,
      tsup: '8.0.0',
      typescript: '5.4.5'
    }
  }, null, 2))

  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      outDir: 'dist'
    },
    include: ['src/**/*']
  }, null, 2))

  fs.writeFileSync(path.join(projectDir, 'cordis.dev.yml'), `- insert:
    - id: ${targetName}-dev
      name: './src/index.ts'
`)

  fs.writeFileSync(path.join(projectDir, 'cordis.patch.yml'), `- insert:
    - id: ${targetName}
      name: '${targetName}'
`)

  fs.writeFileSync(path.join(projectDir, 'src', 'tools', 'greet.ts'), `import { defineTool } from '@deepseek-ai/dsh-tools'

export const greetTool = defineTool({
  name: '${toolName}',
  description: 'Greet a person by name.',
  parameters: {
    name: {
      type: 'string',
      required: true,
      description: 'The name of the person to greet'
    }
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }]
  },
  async execute(args) {
    return \`Hello, \${args.name}! Greetings from the ${targetName} plugin.\`
  }
})
`)

  fs.writeFileSync(path.join(projectDir, 'src', 'services', 'counter.ts'), `import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context {
    counterService: CounterService
  }
}

export class CounterService extends Service {
  private count = 0
  constructor(ctx: Context) {
    super(ctx, 'counterService')
  }
  public increment(): number { return ++this.count }
  public getCount(): number { return this.count }
}
`)

  fs.writeFileSync(path.join(projectDir, 'src', 'index.ts'), `import type { Context } from '@deepseek-ai/cordis'
import { greetTool } from './tools/greet.js'
import { CounterService } from './services/counter.js'

export const name = '${targetName}'
export const inject = ['tools']

export function apply(ctx: Context): void {
  ctx.plugin(CounterService)
  ctx.tools.register(greetTool)
  ctx.effect(() => {
    console.log(\`[\${name}] Plugin initialized successfully in Cordis.\`)
    return () => {
      console.log(\`[\${name}] Resources released.\`)
    }
  })
}
`)

  fs.writeFileSync(path.join(projectDir, 'README.md'), `# ${targetName}

Plugin host-only para DeepSeek Harness.

Incluye un tool de ejemplo llamado ${toolName} y un CounterService efímero basado en memoria.
No declara un client bundle, dsh.client ni la exportación ./client.

## Compatibilidad DSH (preview)

Este template usa la matriz publicada de compatibilidad preview:

- Host/CLI: \`@deepseek-ai/dsh@${dshVersion}\`
- Tools: \`@deepseek-ai/dsh-tools@${dshToolsVersion}\`
- Cordis: \`@deepseek-ai/cordis@${cordisVersion}\`

Los pins de tools y Cordis están en \`package.json\`; DSH es el host/CLI y no se
agrega como dependencia del plugin host-only. Esta es una compatibilidad preview,
no una garantía de estabilidad de DSH. Actualice esta matriz cuando DSH publique
un contrato nuevo.

La guía general para agentes está en AGENTS.md. Para crear, modificar, revisar, construir o instalar
plugins DSH/Cordis, cargá .dsh/skills/dsh-plugin-development/SKILL.md; se carga solo para esas tareas.

## Desarrollo

~~~bash
pnpm install
pnpm run typecheck
pnpm run build
npx -p @deepseek-ai/dsh@${dshVersion} dsh web --patch ./cordis.dev.yml
~~~

El overlay de desarrollo usa ./src/index.ts, una ruta relativa al proyecto generado.

## Instalación en un perfil scratch

~~~bash
npx -p @deepseek-ai/dsh@${dshVersion} dsh plugin --profile scratch add .
npx -p @deepseek-ai/dsh@${dshVersion} dsh --profile scratch --dump-config
~~~

Verificá que la configuración incluya ${targetName}. Después de plugin add, reiniciá el perfil
para que cargue el manifiesto y el plugin:

~~~bash
npx -p @deepseek-ai/dsh@${dshVersion} dsh --profile scratch
~~~

CounterService vive solo en memoria: su contador se reinicia al reiniciar el proceso o desmontar
el plugin y no es persistencia en disco ni en una base de datos.
`)

  fs.writeFileSync(path.join(projectDir, 'AGENTS.md'), `# Guía para agentes

Estas instrucciones aportan el contexto general de este proyecto. Empezá por
el archivo mencionado en la tarea y leé únicamente sus dependencias directas.
Para crear, modificar, revisar, construir o instalar plugins DSH/Cordis, cargá
.dsh/skills/dsh-plugin-development/SKILL.md. La skill se carga solo para esas
tareas.

## Mapa rápido

| Ruta | Propósito |
| --- | --- |
| src/index.ts | Entrada host-only: name, inject y apply. |
| src/tools/greet.ts | Tool ${toolName} definido con defineTool. |
| src/services/counter.ts | Servicio Cordis efímero en memoria. |
| cordis.patch.yml | Manifiesto del bundle. |
| cordis.dev.yml | Overlay local con una ruta relativa. |
| package.json | Contrato de paquete, scripts y dependencias. |
| .dsh/skills/dsh-plugin-development/SKILL.md | Skill técnica para tareas DSH/Cordis. |
| .gitignore | Exclusiones para dependencias, build y registry local. |

## Contratos

- Este proyecto es host-only: no agregues dsh.client, ./client, React, JSX,
  slots ni Conversation Nodes sin una decisión explícita de alcance.
- Conservá ESM, Node.js >= 18 y las extensiones .js en imports relativos.
- Si cambia el proyecto generado, actualizá las plantillas de la fuente de
  verdad: create-dsh-plugin.mjs.
- Mantené la skill local y el .gitignore sincronizados con sus plantillas del
  generador.
- Mantené el nombre del package, el name del patch y el ID de la fila
  coherentes.
- CounterService no persiste datos: el contador se reinicia al desmontar el
  plugin o reiniciar el proceso.

## Flujo mínimo

~~~bash
pnpm install
pnpm run typecheck
pnpm run build
npx -p @deepseek-ai/dsh@${dshVersion} dsh web --patch ./cordis.dev.yml
~~~

Para cambios del CLI, probá desde un directorio temporal y no generes proyectos
de prueba dentro del repositorio.
`)

  console.log(`\x1b[32m✔ Project ${targetName} initialized successfully.\x1b[0m`)
}

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`\x1b[31mError: ${message}\x1b[0m`)
  process.exitCode = 1
})
