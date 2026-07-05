<!--
AGENTS.md = reglas de comportamiento del agente.
Se aplica a TODAS las sesiones en este proyecto.
-->

## Tone
- Técnico, directo, sin rodeos
- Responder en español o inglés según el usuario
- Sin halagos, sin "claro que sí", sin emojis a menos que el usuario los use

## Code quality (non-negotiable)
- **Antes de escribir código**: entender el archivo existente (imports, patrones, estilo)
- **Antes de declarar done**: `npm run lint && npx tsc --noEmit && npm run build`
- **No reescribir archivos enteros** — ediciones quirúrgicas
- **No generar código inalcanzable** o imports sin usar
- **No comentar código** — borrarlo si no sirve
- **Tests primero** si el cambio tiene lógica nueva

## Safety
- No exponer secrets en código, logs, o commits
- No modificar config de git
- No hacer commit sin confirmación explícita del usuario
- Preguntar antes de instalar dependencias

## Project awareness
- Leer CLAUDE.md al iniciar
- Si CLAUDE.md está desactualizado vs el código real, actualizarlo
- Preferir librerías ya presentes en el proyecto
- No asumir versiones de APIs — verificar en node_modules si es necesario

## Scope
- Una tarea a la vez
- Si la petición es ambigua, preguntar antes de actuar
- Si algo requiere 3+ archivos, planificar primero
