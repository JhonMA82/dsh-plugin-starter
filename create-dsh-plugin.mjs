#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'

const args = process.argv.slice(2)
let targetName = args[0]

async function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans.trim())
  }))
}

async function run() {
  if (!targetName) {
    targetName = await askQuestion('Nombre del plugin (ej. dsh-custom-tools): ')
    if (!targetName) targetName = 'dsh-my-plugin'
  }

  const projectDir = path.resolve(process.cwd(), targetName)
  if (fs.existsSync(projectDir)) {
    console.error(`\x1b[31mError: El directorio "${targetName}" ya existe.\x1b[0m`)
    process.exit(1)
  }

  console.log(`\x1b[36mCreando plugin en:\x1b[0m ${projectDir}\n`)
  fs.mkdirSync(path.join(projectDir, 'src', 'tools'), { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'src', 'services'), { recursive: true })

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
    name: targetName,
    version: '0.1.0',
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    files: ['dist', 'cordis.patch.yml'],
    scripts: {
      build: 'tsup src/index.ts --format esm --dts --clean',
      dev: 'tsup src/index.ts --format esm --watch',
      prepare: 'npm run build'
    },
    dsh: { bundle: { patch: './cordis.patch.yml' } },
    peerDependencies: {
      '@deepseek-ai/cordis': '^0.1.0',
      '@deepseek-ai/dsh-tools': '^0.1.0'
    },
    devDependencies: {
      '@deepseek-ai/cordis': '^0.1.0',
      '@deepseek-ai/dsh-tools': '^0.1.0',
      tsup: '^8.0.0',
      typescript: '^5.4.0'
    }
  }, null, 2))

  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      outDir: 'dist'
    },
    include: ['src/**/*']
  }, null, 2))

  fs.writeFileSync(path.join(projectDir, 'cordis.dev.yml'), `- insert:
    - id: ${targetName}-dev
      name: '${path.join(projectDir, 'src', 'index.ts')}'
`)

  fs.writeFileSync(path.join(projectDir, 'cordis.patch.yml'), `- insert:
    - id: ${targetName}
      name: '${targetName}'
`)

  fs.writeFileSync(path.join(projectDir, 'src', 'tools', 'greet.ts'), `import { defineTool } from '@deepseek-ai/dsh-tools'

export const greetTool = defineTool({
  name: 'greet',
  description: 'Saluda a una persona por su nombre.',
  parameters: {
    name: {
      type: 'string',
      required: true,
      description: 'El nombre de la persona a saludar'
    }
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }]
  },
  async execute(args) {
    return \`¡Hola, \${args.name}! Saludos desde el plugin \${targetName}.\`
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

export function apply(ctx: Context) {
  ctx.plugin(CounterService)
  ctx.tools.register(greetTool)
  ctx.effect(() => {
    console.log(\`[\${name}] Plugin inicializado exitosamente en Cordis.\`)
    return () => {
      console.log(\`[\${name}] Recursos liberados.\`)
    }
  })
}

export default { name, inject, apply }
`)

  fs.writeFileSync(path.join(projectDir, 'README.md'), `# \${targetName}

Plugin para DeepSeek Harness.
Para probarlo:
1. pnpm install
2. pnpm run build
3. pnpm dsh web --patch ./cordis.dev.yml
`)

  console.log(`\x1b[32m✔ Proyecto ${targetName} inicializado con éxito.\x1b[0m`)
}

run()
