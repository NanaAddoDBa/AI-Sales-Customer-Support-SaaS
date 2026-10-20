# AI Sales & Customer Support SaaS — Codex / desktop Work handoff

Prepared 2026-10-20. This is a project-context and execution-instruction package,
not an application implementation, Git bundle, automatic mode switch, or deployment.
No local Windows session or GitHub write is performed by downloading this package.

## Start on your Windows computer

1. Create or open the intended project folder:
   `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`
2. Extract this ZIP's contents into that folder so `AGENTS.md` and `CODEX_START.md`
   are directly inside it. There is no extra enclosing folder in the ZIP.
   Do not overwrite existing work. For a nonempty folder with conflicting filenames,
   extract into a separate temporary folder, add access to it in Codex, and ask
   Codex to reconcile the handoff into the project while preserving existing files.
3. Open that project in **Codex on desktop**, working in the **local checkout**.
   Do not choose an isolated worktree/cloud environment when expecting immediate
   edits in this exact Windows directory. Native Windows is the default here;
   use WSL only when deliberately configured and document the mapped location.
4. Start a task with the contents of `CODEX_START.md`, or use this shorter prompt:

   > Read AGENTS.md, CODEX_START.md, docs/handoff/CURRENT_STATE.md and
   > docs/handoff/EXECUTION_PLAN.md. Inspect this checkout and the configured
   > GitHub remote, then implement the project in ordered vertical slices.
   > Create real files, run focused checks, commit and push coherent changes
   > using my authorized Git access. Keep PROGRESS.md and TASKS.json current.
   > Begin with repository setup and the reproducible monorepo build, then
   > the account-to-widget-to-human-reply journey. Do not stop at another plan.

GitHub target: `https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS.git`.
The local agent must verify access, history, branches and working-tree state before
writing/pushing. A missing login is not permission to invent credentials.

## Desktop Work alternative

From this ChatGPT project's context, open a **desktop Work** task and explicitly
attach the local project folder. Supply this same handoff and prompt. The agent
must use the authorized local environment and verify its working directory.
Cloud-only Work is not a way to directly write the Windows path. Codex is the
recommended route for the implementation, tests, terminal and Git workflow.
See `docs/handoff/OPENAI_SETUP_SOURCES.md` for official references.

## What this preserves

- The original nine-document blueprint, also extracted into readable specification files.
- The combined blueprint and the full corrected 44-item production checklist.
- The exact requested local path and repository, modular architecture, feature-based
  commits, website-first launch scope, human control and production acceptance gates.
- A staged execution plan, task ledger, evidence requirements, external-access gates,
  and a resume prompt for subsequent sessions.

It is not a verbatim export of the entire chat. It does not transfer credentials,
account permissions, local device access or hidden conversation context.

## File guide

| File | Purpose |
|---|---|
| `AGENTS.md` | Active repository-wide engineering and safety rules |
| `CODEX_START.md` | Initial implementation task |
| `CODEX_RESUME.md` | Resume from actual files, commits and evidence |
| `PROGRESS.md` | Human-readable working checkpoint; initially not started |
| `TASKS.json` | All 44 original tasks with open status and empty evidence |
| `docs/handoff/EXECUTION_PLAN.md` | Ordered phases and acceptance criteria |
| `docs/handoff/CURRENT_STATE.md` | Corrected baseline and limits of prior evidence |
| `docs/handoff/DECISIONS.md` | Requirements, defaults and unresolved external choices |
| `docs/handoff/ACCESS_AND_APPROVALS.md` | Access checklist and consequential-action gates |
| `docs/handoff/EVIDENCE_TEMPLATE.md` | What each completed slice must prove |
| `docs/specs/` | Product, architecture, security, delivery, operations, costs and sources |
| `docs/reference/verified-status-and-checklist.md` | Original detailed acceptance checklist |
| `docs/archive/` | Preserved source files, including the quarantined unusable old handover |
| `MANIFEST.json` | Packaging-only inventory and SHA-256 checksums |

**Never run the old Install-Project.ps1.** It is quarantined inside the archive
named `OBSOLETE-handover-DO-NOT-RUN.zip`; its required implementation bundle is
absent. No active installer is supplied here. Codex is to create the real source.

## Success of the transfer

The transfer is confirmed only when your local agent reports its actual working
path, names the handoff files it has read, inspects Git state, and starts producing
verifiable source changes. Packaging these instructions does not perform that step.
