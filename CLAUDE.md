@AGENTS.md

## Claude Should NOT Run the Dev Server

**Claude will NOT:**

- Start the dev server (`npm run dev`)
- Build the project (`npm run build`)
- Run tests or test commands
- Start Sanity Studio

**You will test everything yourself after Claude makes changes.**

Claude will only:

- Read and modify files
- Verify TypeScript syntax is correct
- Check that imports/exports are valid
- Ensure types compile properly
