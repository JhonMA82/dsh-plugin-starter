# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

## [Unreleased]

## [0.2.0-alpha.1] - 2026-09-03

### Added

- Selector explícito de templates `host-only` y `full-stack`, con `--help` y validación clara de opciones.
- Contexto AI-friendly en `AGENTS.md` y skill local para tareas de desarrollo de plugins DSH/Cordis.

### Changed

- Contrato del paquete host-only con exports nombrados, manifests relativos y documentación sincronizada desde el generador.
- Compatibilidad preview fijada a DSH `0.1.2-alpha.2`, dsh-tools `0.1.2-alpha.2`, Cordis `4.0.2` y TypeScript `5.4.5`.
- `full-stack` queda reconocido pero reservado hasta verificar el contrato client/build.

### Fixed

- Validación de nombres y destinos para impedir rutas inseguras y evitar sobrescribir directorios existentes.
- El CLI muestra correctamente el nombre del proyecto generado y rechaza templates, flags y argumentos inválidos.

## [0.1.1] - 2026-09-03

### Added

- Estructura inicial para desarrollar plugins y tools de DeepSeek Harness con Cordis.
- Manifiestos de desarrollo y bundle, ejemplos de tools y servicios, y generador CLI.

### Changed

- Documentado en el README cómo crear un proyecto con `create-dsh-plugin.mjs`, instalar sus dependencias, compilarlo y probarlo.

[Unreleased]: https://github.com/JhonMA82/dsh-plugin-starter/compare/v0.2.0-alpha.1...HEAD
[0.2.0-alpha.1]: https://github.com/JhonMA82/dsh-plugin-starter/compare/v0.1.1...v0.2.0-alpha.1
[0.1.1]: https://github.com/JhonMA82/dsh-plugin-starter/compare/v0.1.0...v0.1.1
