# DeepSeek Harness Plugin Starter (Kickstarter & Boilerplate)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework: Cordis](https://img.shields.io/badge/Framework-Cordis-blueviolet)](https://github.com/deepseek-ai/deepseek-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plantilla de inicio y boilerplate modular para el desarrollo de plugins y herramientas (tools) para [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/), el runtime de agentes de código abierto impulsado por el meta-framework **Cordis**.

## 📋 Características

- ⚡ **Arquitectura basada en Cordis:** Todo en DeepSeek Harness es un plugin desacoplado con inyección estricta de dependencias.
- 🛠️ **DSL de herramientas (`defineTool`):** Tipado automático, validación de parámetros de entrada y renderizado semántico para el modelo LLM.
- 🔄 **Ciclo de vida y limpieza reactiva:** Gestión automática de desmontaje y desecho de recursos mediante `ctx.effect()`.
- 📦 **Listo para empaquetar como Bundle:** Manifiesto configurado con soporte nativo para perfiles de DeepSeek Harness (`dsh plugin add`).
- 🧪 **Doble entorno de ejecución:** Configurado tanto para desarrollo en caliente mediante overlays (`--patch`) como para distribución modular.
- 🚀 **Generador CLI incluido:** Crea proyectos listos con un solo comando (`create-dsh-plugin.mjs`).

## 📂 Estructura del Repositorio

```text
.
├── cordis.dev.yml           # Overlay local para depuración directa con --patch
├── cordis.patch.yml         # Capa de configuración para perfiles (Bundle manifest)
├── package.json             # Metadatos del paquete y especificación dsh.bundle
├── tsconfig.json            # Configuración de TypeScript en modo ESM estricto
├── src/
│   ├── index.ts             # Entrada del plugin (apply, inject y ciclo de vida)
│   ├── tools/
│   │   └── greet.ts         # Ejemplo de Tool registrado para el agente LLM
│   └── services/
│       └── counter.ts       # Ejemplo de servicio Cordis compartido
└── README.md
```

## ⚙️ Requisitos Previos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)
- Entorno de **DeepSeek Harness** instalado localmente (`dsh` CLI disponible).

## 🚀 Inicio Rápido

1. Instalar dependencias:
   ```bash
   pnpm install
   ```
2. Compilar TypeScript:
   ```bash
   pnpm run build
   ```
3. Probar en la Web UI:
   ```bash
   pnpm dsh web --patch ./cordis.dev.yml
   ```
4. Instalar en un perfil de DeepSeek Harness:
   ```bash
   dsh plugin --profile demo add ./
   dsh --profile demo
   ```

## 📚 Documentación Oficial

- [Your first plugin | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/)
- [Build a tool | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/tool)
- [Package and install a plugin | DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish)
