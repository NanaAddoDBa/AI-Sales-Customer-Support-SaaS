# Official setup references

Checked during preparation on 20 October 2026. Interface availability still depends
on the installed client, plan and workspace permissions. Re-check current official
docs if the UI differs. This is setup guidance, not a claim your computer is connected.

## Work, Codex and project context

https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex

The desktop app provides Codex for repository/terminal/code work, and desktop Work
can use permitted local folders. Codex history is separate from ChatGPT history.
Open a desktop local folder explicitly; a chat message alone does not attach a drive.
Cloud Work and cloud coding environments must not be mistaken for the local checkout.

## Local versus isolated environments

https://learn.chatgpt.com/docs/environments/modes

Choose the local checkout for immediate writes to the requested Windows directory.
Isolated worktrees/cloud environments have different locations; any later handoff or
synchronization must be verified rather than assumed.

## Windows desktop setup and permissions

https://learn.chatgpt.com/docs/windows/windows-app
https://learn.chatgpt.com/docs/windows/windows-sandbox

Use the supported desktop/local setup and retain normal approval/security controls.
No unrestricted-mode or sandbox-bypass flag is necessary in this handoff.

## Repository guidance and long tasks

https://learn.chatgpt.com/docs/agent-configuration/agents-md
https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex

AGENTS.md is recognized repository guidance. PROGRESS.md, TASKS.json,
CODEX_START.md and CODEX_RESUME.md are conventions in this handoff, not magic files
that automatically launch or guarantee completion. Start the task explicitly.
