# Superpowers Configuration

This project uses [obra/superpowers](https://github.com/obra/superpowers) — a complete software development workflow for coding agents.

## Installation

Superpowers is installed globally at `~/.claude/plugins/superpowers/` with skills available at `~/.claude/skills/`.

The `SessionStart` hook in `~/.claude/settings.json` injects the `using-superpowers` skill context at the start of each session.

## Available Skills

| Skill | When to Use |
|-------|-------------|
| `brainstorming` | Before any feature work — refines requirements through conversation |
| `test-driven-development` | When implementing features — enforces RED-GREEN-REFACTOR |
| `subagent-driven-development` | When executing plans — dispatches fresh subagents per task |
| `writing-plans` | After design approval — breaks work into bite-sized tasks |
| `systematic-debugging` | When hitting bugs — 4-phase root cause analysis |
| `using-git-worktrees` | Before feature work — creates isolated branches |
| `requesting-code-review` | When completing tasks — reviews against the plan |
| `finishing-a-development-branch` | When tasks are done — merge/PR/discard decision |
| `verification-before-completion` | Before claiming work done — confirms it actually works |
| `executing-plans` | When running a plan with checkpoints |
| `dispatching-parallel-agents` | For 2+ independent tasks |
| `receiving-code-review` | When responding to review feedback |
| `writing-skills` | When creating custom skills |

## Updating Superpowers

```bash
cd ~/.claude/plugins/superpowers && git pull
cp -r skills/. ~/.claude/skills/
```
