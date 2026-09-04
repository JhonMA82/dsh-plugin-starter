# Guía para agentes

## Alcance y estrategia de lectura

Estas instrucciones aplican a todo el repositorio. El proyecto es pequeño y no
tiene subproyectos, por lo que este `AGENTS.md` raíz es la única guía necesaria.
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

## Mapa del proyecto

| Ruta | Propósito |
| --- | --- |
| `create-dsh-plugin.mjs` | CLI que genera un proyecto nuevo desde plantillas embebidas. |
| `src/index.ts` | Entrada del plugin: exporta `name`, `inject`, `apply` y el plugin default. |
| `src/tools/greet.ts` | Tool de ejemplo definido con `defineTool`. |
| `src/services/counter.ts` | Servicio de ejemplo basado en `Service` de Cordis. |
| `cordis.dev.yml` | Overlay para desarrollo local con `--patch`. |
| `cordis.patch.yml` | Manifiesto del bundle del plugin. |
| `package.json` | Metadatos, scripts y dependencias del starter. |
| `README.md` | Guía de uso para personas. |

## Contratos importantes

- El runtime usa Node.js >= 18, TypeScript y módulos ESM.
- Conservá las extensiones `.js` en imports relativos de archivos TypeScript.
- Si cambia el proyecto generado, modificá las plantillas dentro de
  `create-dsh-plugin.mjs`; no corrijas solo un proyecto generado de ejemplo.
- El generador crea el destino debajo del directorio actual y no sobrescribe un
  directorio existente.
- El nombre puede recibirse como primer argumento. Sin argumento, el CLI lo
  solicita y usa `dsh-my-plugin` si la respuesta queda vacía.
- `dist/` es salida de build: no la edites manualmente ni la agregues al
  repositorio salvo que la tarea lo pida explícitamente.
- No agregues dependencias ni cambies el gestor de paquetes sin una necesidad
  concreta. Si se modifica la instalación, regenerá el lockfile con el gestor
  correspondiente; nunca lo edites manualmente.

## Comandos útiles

```bash
pnpm install
pnpm run build
pnpm run dev
node ./create-dsh-plugin.mjs dsh-custom-tools
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
