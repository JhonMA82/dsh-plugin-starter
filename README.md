# DeepSeek Harness Plugin Starter (Kickstarter & Boilerplate)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework: Cordis](https://img.shields.io/badge/Framework-Cordis-blueviolet)](https://github.com/deepseek-ai/deepseek-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plantilla de inicio y boilerplate modular para el desarrollo de plugins host-only y herramientas (tools) para [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/), el runtime de agentes de código abierto impulsado por el meta-framework **Cordis**.

Este proyecto se ejecuta en el host con Node.js, TypeScript, ESM y Cordis. No declara un client bundle:
no incluye `dsh.client`, la exportación `./client`, React, JSX, slots ni Conversation Nodes.

## Compatibilidad DSH (preview)

Este starter host-only apunta a la matriz publicada de compatibilidad preview:

| Paquete | Versión |
| --- | --- |
| Host/CLI `@deepseek-ai/dsh` | `0.1.2-alpha.2` |
| Tools `@deepseek-ai/dsh-tools` | `0.1.2-alpha.2` |
| Cordis `@deepseek-ai/cordis` | `4.0.2` |

Los pins de tools y Cordis están en `package.json`; `@deepseek-ai/dsh` es el
host/CLI y no se agrega como dependencia del plugin host-only. Esta es una
compatibilidad preview, no una garantía de estabilidad de DSH. Actualice esta
matriz cuando DSH publique un contrato nuevo.

`AGENTS.md` contiene el contexto general para agentes. La skill local
`.dsh/skills/dsh-plugin-development/SKILL.md` se carga únicamente para tareas de crear, modificar,
revisar, construir o instalar plugins DSH/Cordis.

## 📋 Características

- ⚡ **Arquitectura basada en Cordis:** Todo en DeepSeek Harness es un plugin desacoplado con inyección estricta de dependencias.
- 🛠️ **DSL de herramientas (`defineTool`):** Tipado automático, validación de parámetros de entrada y renderizado semántico para el modelo LLM.
- 🔄 **Ciclo de vida y limpieza reactiva:** Gestión automática de desmontaje y desecho de recursos mediante `ctx.effect()`.
- 📦 **Listo para empaquetar como Bundle host-only:** Manifiesto y exports configurados para perfiles de DeepSeek Harness.
- 🧪 **Desarrollo y distribución reproducibles:** Overlay relativo para desarrollo y guía para instalarlo en un perfil aislado.
- 🚀 **Generador CLI incluido:** Crea proyectos listos con un solo comando (`create-dsh-plugin.mjs`).

## 📂 Estructura del Repositorio

```text
.
├── cordis.dev.yml           # Overlay local para depuración directa con --patch
├── cordis.patch.yml         # Capa de configuración para perfiles (Bundle manifest)
├── package.json             # Metadatos, exports host-only y especificación dsh.bundle
├── tsconfig.json            # Configuración de TypeScript en modo ESM estricto
├── src/
│   ├── index.ts             # Entrada del plugin (apply, inject y ciclo de vida)
│   ├── tools/
│   │   └── greet.ts         # Tool dsh_plugin_starter_greet registrado para el agente LLM
│   └── services/
│       └── counter.ts       # Servicio Cordis efímero en memoria
├── .dsh/skills/
│   └── dsh-plugin-development/SKILL.md # Skill DSH/Cordis de carga condicional
├── .gitignore                # Dependencias, build y registry local
├── AGENTS.md                 # Contexto general para agentes
└── README.md
```

## Templates y selector del CLI

El generador separa el template del origen de desarrollo o instalación:

| Template | Estado | Resultado |
| --- | --- | --- |
| `host-only` | Disponible y predeterminado | Genera el paquete host-only actual. |
| `full-stack` | Reconocido, pero reservado | Falla explícitamente; todavía no se genera. |

Estos comandos seleccionan el único template generable hoy:

```bash
node ./create-dsh-plugin.mjs dsh-custom-tools
node ./create-dsh-plugin.mjs --template host-only dsh-custom-tools
node ./create-dsh-plugin.mjs --template=host-only dsh-custom-tools
node ./create-dsh-plugin.mjs -t host-only dsh-custom-tools
```

Para consultar el uso, los templates y las fuentes de instalación:

```bash
node ./create-dsh-plugin.mjs --help
```

`full-stack` se reconoce para que el CLI informe el límite de forma explícita,
pero no está disponible todavía. La investigación sobre el DSH oficial actual
no permite confirmar un template independiente compilable: el helper client es
interno y las APIs/documentación referenciadas usan contratos anteriores. Por
eso requiere un contrato `client/build` verificado antes de generar archivos;
el comando falla antes de pedir el nombre o crear el destino y no debe tratarse
como una plantilla funcional.

`local` no es un template. Es una modalidad independiente para elegir la fuente
de desarrollo o instalación: use `--patch` para desarrollo directo, una ruta
local para instalar un proyecto generado o una referencia Git para instalarlo
desde un repositorio. Por ejemplo:

```bash
npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh web --patch ./cordis.dev.yml
npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh plugin --profile scratch add ./dsh-custom-tools
```

La fuente local o Git no cambia el template generado ni se indica con
`--template local`.

## 🧰 Crear un proyecto con el CLI

Desde la raíz de este repositorio, ejecutá el generador indicando el nombre del
plugin:

```bash
node ./create-dsh-plugin.mjs dsh-custom-tools
```

También podés ejecutarlo sin argumentos. El CLI te va a pedir el nombre y, si
dejás la respuesta vacía, usará `dsh-my-plugin`:

```bash
node ./create-dsh-plugin.mjs
```

El nombre debe ser un slug seguro en minúsculas, sin rutas, espacios ni `..`.
El destino se crea debajo de la carpeta actual y no debe existir previamente.
El generador incluye la configuración de TypeScript, los manifiestos de Cordis,
un tool de ejemplo namespaceado, un servicio contador, un README, un `AGENTS.md`,
la skill local y un `.gitignore` iniciales.

El generador mantiene sus plantillas como fuente de verdad para sincronizar el
código, el README, el `AGENTS.md` y la skill local de cada proyecto generado.

Luego, instalá las dependencias y compilá el proyecto generado:

```bash
cd dsh-custom-tools
pnpm install
pnpm run typecheck
pnpm run build
```

Para probarlo en la Web UI de DeepSeek Harness:

```bash
npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh web --patch ./cordis.dev.yml
```

El archivo `cordis.dev.yml` usa la ruta relativa `./src/index.ts`; no guarda
rutas absolutas de la máquina donde se ejecutó el generador.

## ⚙️ Requisitos Previos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)
- Acceso a npm para ejecutar el CLI reproducible con `npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh ...`.

## 🚀 Inicio Rápido

1. Instalar dependencias:
   ```bash
   pnpm install
   ```
2. Verificar tipos del host:
   ```bash
   pnpm run typecheck
   ```
3. Compilar TypeScript:
   ```bash
   pnpm run build
   ```
4. Probar en la Web UI:
   ```bash
   npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh web --patch ./cordis.dev.yml
   ```
5. Instalar en un perfil scratch de DeepSeek Harness:
   ```bash
   npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh plugin --profile scratch add ./
   npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh --profile scratch --dump-config
   ```

`--dump-config` permite revisar la composición del perfil sin iniciar una
sesión. Después de `plugin add` tenés que reiniciar el perfil para que cargue el
manifiesto y el plugin:

```bash
npx -p @deepseek-ai/dsh@0.1.2-alpha.2 dsh --profile scratch
```

## Ejemplos incluidos

- `dsh_plugin_starter_greet` es un tool de ejemplo definido con `defineTool`.
- `CounterService` es un servicio de Cordis que vive solo en memoria. Su
  contador se reinicia cuando se desmonta el plugin o se reinicia el proceso;
  no es persistencia en disco ni en una base de datos.

## Guías para agentes

`AGENTS.md` es el contexto general del proyecto. La skill local se carga solo
cuando la tarea involucra crear, modificar, revisar, construir o instalar un
plugin DSH/Cordis; no duplica la documentación completa de plugins client.

## 📚 Documentación Oficial

- [Your first plugin | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/)
- [Build a tool | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/tool)
- [Package and install a plugin | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)

## Referencias upstream adicionales

- [Developing DSH plugins](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/docs/developing-dsh-plugins.md)
- [Upstream dsh-plugin-development skill](https://github.com/NanmiCoder/dsh-agent-teams/blob/main/.dsh/skills/dsh-plugin-development/SKILL.md)

La skill local es una adaptación breve y host-only de estas referencias; no las
duplica ni incorpora su infraestructura client/full-stack.
