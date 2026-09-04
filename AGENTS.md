# Guía para agentes

## Alcance y estrategia de lectura

Estas instrucciones aplican a todo el repositorio. El proyecto es pequeño y no
tiene subproyectos; este `AGENTS.md` raíz aporta el contexto general. La skill
local `.dsh/skills/dsh-plugin-development/SKILL.md` se carga únicamente para
tareas de crear, modificar, revisar, construir o instalar plugins DSH/Cordis.
No agregues archivos `AGENTS.md` anidados salvo que aparezca un subproyecto con
reglas realmente independientes.

Para ahorrar tiempo y contexto:

1. Empezá por el archivo mencionado en la tarea.
2. Leé solo sus dependencias directas y los archivos necesarios para verificar
   el cambio.
3. No recorras todo el repositorio ni abras archivos no relacionados.
4. Buscá símbolos o referencias únicamente cuando el archivo inicial no alcance
   para resolver la tarea.
5. Conservá los cambios acotados; no hagas refactors oportunistas.
6. Revisá `git status` antes de editar y no sobrescribas cambios existentes.
7. Si la tarea es de DSH/Cordis, cargá la skill local después de identificar el
   archivo inicial y sus dependencias directas.

## Mapa del proyecto

| Ruta | Propósito |
| --- | --- |
| `create-dsh-plugin.mjs` | CLI que genera un proyecto nuevo desde plantillas embebidas. |
| `src/index.ts` | Entrada del plugin: exporta `name`, `inject` y `apply`, sin default export. |
| `src/tools/greet.ts` | Tool de ejemplo definido con `defineTool`. |
| `src/services/counter.ts` | Servicio de ejemplo basado en `Service` de Cordis. |
| `cordis.dev.yml` | Overlay para desarrollo local con `--patch`. |
| `cordis.patch.yml` | Manifiesto del bundle del plugin. |
| `.dsh/skills/dsh-plugin-development/SKILL.md` | Skill técnica para tareas DSH/Cordis; carga condicional. |
| `.gitignore` | Exclusiones para dependencias, build y registry local. |
| `AGENTS.md` | Instrucciones AI-friendly para trabajar en este starter. |
| `package.json` | Metadatos, scripts y dependencias del starter. |
| `README.md` | Guía de uso para personas. |

## Contratos importantes

- El runtime usa Node.js >= 18, TypeScript y módulos ESM.
- Conservá las extensiones `.js` en imports relativos de archivos TypeScript.
- El paquete es host-only: exporta `.`, `./cordis.patch.yml` y `./package.json`; no declara `./client` ni `dsh.client`.
- Si cambia el proyecto generado, modificá las plantillas dentro de
  `create-dsh-plugin.mjs`; no corrijas solo un proyecto generado de ejemplo.
- El generador debe mantener sincronizados el código, el README, el `AGENTS.md`,
  la skill local y el `.gitignore` del proyecto generado.
- El generador valida el nombre como slug seguro antes de interpolarlo o crear
  directorios, mantiene el destino debajo de `process.cwd()` y no sobrescribe
  un directorio existente.
- El nombre puede recibirse como primer argumento. Sin argumento, el CLI lo
  solicita y usa `dsh-my-plugin` si la respuesta queda vacía.
- El selector de template usa `host-only` por defecto y acepta
  `--template <name>`, `--template=<name>` y `-t <name>`; flags, templates y
  argumentos posicionales inválidos deben rechazarse con errores claros.
- `full-stack` es una opción reconocida pero reservada: debe fallar antes de
  pedir el nombre o crear directorios hasta contar con un contrato
  client/build verificado. No inventes React, APIs client, dependencias,
  `tsdown`, slots ni archivos full-stack.
- `local` no es un template; es una fuente independiente de desarrollo o
  instalación mediante `--patch`, una ruta local o Git.
- `package.json` debe conservar el script `typecheck` apuntando al tsconfig del
  host.
- `dist/` es salida de build: no la edites manualmente ni la agregues al
  repositorio salvo que la tarea lo pida explícitamente.
- `.atl/` es el registry local de skills: no lo versionés.
- No agregues dependencias ni cambies el gestor de paquetes sin una necesidad
  concreta. Si se modifica la instalación, regenerá el lockfile con el gestor
  correspondiente; nunca lo edites manualmente.

## Comandos útiles

```bash
pnpm install
pnpm run typecheck
pnpm run build
pnpm run dev
node ./create-dsh-plugin.mjs dsh-custom-tools
node ./create-dsh-plugin.mjs --template host-only dsh-custom-tools
node ./create-dsh-plugin.mjs
node --check create-dsh-plugin.mjs
```

El repositorio no tiene una suite de tests configurada. Para cambios en el CLI,
ejecutá una prueba puntual en un directorio temporal y verificá el nombre,
archivos generados y mensaje final. No generes proyectos de prueba dentro del
repositorio.

## Verificación mínima

Antes de entregar un cambio:

1. Ejecutá `git diff --check`.
2. Ejecutá el chequeo enfocado correspondiente al archivo modificado.
3. Ejecutá `pnpm run build` si las dependencias ya están instaladas; si no,
   informá que el build no pudo ejecutarse sin instalar dependencias nuevas.
4. Reportá exactamente qué verificaste y qué quedó pendiente.
