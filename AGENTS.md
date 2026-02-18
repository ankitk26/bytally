# Scripts execution

- Use bun for any script
- If committing any changes, write a commit message not more than 6 words and use all lower case
- Before commiting, run `bun run lint` and `bun run fmt`
- Do not run `bun run build` unless asked
- Never run `bunx convex dev`
- After every change, run `bun run fmt`

# Components

- Each .tsx file should have only 1 component
- Each component should server one purpose
- Use the name "Props" for all Props
- Prefer types over interfaces if possible
