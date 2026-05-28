# My Skill Builder

[中文主页](./README.md) | [English](./README.en.md)

Builds complete custom skills from rough ideas. Invoke when a user wants to create, structure, refine, scaffold, or publish a skill with the right template and execution layer.

## Why This Skill

- Combines routing, workflows, and execution
- Supports richer product-like skills
- Keeps layered responsibilities clear

## Install

```bash
npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder
```

## Community Scenarios

- Complex skills with decision, workflow, and execution layers
- Long-running or multi-mode skills
- Product-like skills with delivery loops

## What It Generates

- Typed `SKILL.md` skeletons for `knowledge`, `router`, `workflow`, `executor`, and `hybrid`
- Typed `references/overview.md` templates
- Typed `scripts/` scaffolds
- Publishable packages with `README.md`, `README.en.md`, `LICENSE`, and `package.json`
- Real install snippets using `--repo-owner`, `--repo-name`, or `--repo-url`

## Agent Targets

- `npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder --agent codex`
- `npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder --agent cursor`

## Project Layout

- `SKILL.md`
- `scripts/` for execution layer helpers
- `references/` for decision rules, workflow notes, and execution notes

## Core Scaffold

```bash
node ./scripts/scaffold-skill.js --name weekly-report-skill
```

## Publishing Notes

- Install snippets already point to the configured repository source.
- Review `SKILL.md`, `scripts/`, and `references/` before publishing.
