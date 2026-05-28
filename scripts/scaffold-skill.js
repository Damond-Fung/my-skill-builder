import fs from "node:fs/promises";
import path from "node:path";

const SKILL_TYPES = ["knowledge", "router", "workflow", "executor", "hybrid"];
const README_STYLES = ["minimal", "open-source", "community"];

function printHelp() {
  console.log(`my-skill-builder scaffold

Usage:
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name <skill-name> [options]

Options:
  --name <skill-name>         Required. Kebab-case skill name, e.g. weekly-report-skill
  --type <type>               Optional. knowledge | router | workflow | executor | hybrid | auto
  --title <title>             Optional. Markdown title, defaults from name
  --description <text>        Optional. Frontmatter description
  --invoke-when <text>        Optional. Appended to description when missing
  --agent-target <agents>     Optional. Comma-separated agent targets for install snippets
  --repo-owner <owner>        Optional. GitHub owner for install snippets, e.g. your-name
  --repo-name <name>          Optional. Repository name for install snippets, defaults to skill name
  --repo-url <url>            Optional. Full git or GitHub URL for install snippets
  --publish-readme-style <s>  Optional. minimal | open-source | community
  --with-scripts <mode>       Optional. auto | true | false
  --with-references <mode>    Optional. auto | true | false
  --publishable               Optional. Generate a publishable single-skill package root
  --target-root <path>        Optional. Default: current working directory
  --force                     Optional. Overwrite existing SKILL.md
  --help                      Show help

Examples:
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name weekly-report-skill
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name knowledge-api-guide --type knowledge
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name publishable-router --type router --publishable
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name publishable-router --type router --publishable --agent-target codex,cursor
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name publishable-router --type router --publishable --repo-owner your-name --repo-name my-router-repo
  node ./.trae/skills/my-skill-builder/scripts/scaffold-skill.js --name image-router --title "Image Router" --invoke-when "Invoke when a user needs image model routing."
`);
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

function toTitleCase(name) {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ensureKebabCase(name) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

function normalizeMode(value, fallback = "auto") {
  if (!value) return fallback;
  const normalized = String(value).toLowerCase();
  if (["auto", "true", "false"].includes(normalized)) {
    return normalized;
  }
  throw new Error(`Invalid mode: ${value}. Use auto, true, or false.`);
}

function normalizeReadmeStyle(value) {
  if (!value) return "open-source";
  const normalized = String(value).toLowerCase();
  if (README_STYLES.includes(normalized)) {
    return normalized;
  }
  throw new Error(`Invalid --publish-readme-style: ${value}. Use one of ${README_STYLES.join(", ")}.`);
}

function parseAgentTargets(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferSkillType(options) {
  const explicitType = options.type?.toLowerCase();
  if (explicitType && explicitType !== "auto") {
    if (!SKILL_TYPES.includes(explicitType)) {
      throw new Error(`Invalid --type: ${options.type}. Use one of ${SKILL_TYPES.join(", ")}, or auto.`);
    }
    return explicitType;
  }

  const source = [options.name, options.title, options.description, options.invokeWhen]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(guide|docs|documentation|reference|best-practice|cookbook|knowledge|manual)/.test(source)) {
    return "knowledge";
  }
  if (/(router|routing|selector|pick|choose|vendor|provider|model)/.test(source)) {
    return "router";
  }
  if (/(workflow|pipeline|process|report|planner|builder|generator|orchestr|agent)/.test(source)) {
    return "workflow";
  }
  if (/(cli|executor|runner|script|deploy|download|upload|sync|adapter|tool)/.test(source)) {
    return "executor";
  }
  return "hybrid";
}

function shouldCreateScripts(type, mode) {
  const normalizedMode = normalizeMode(mode);
  if (normalizedMode === "true") return true;
  if (normalizedMode === "false") return false;
  return type === "executor" || type === "hybrid";
}

function shouldCreateReferences(type, mode) {
  const normalizedMode = normalizeMode(mode);
  if (normalizedMode === "true") return true;
  if (normalizedMode === "false") return false;
  return type === "knowledge" || type === "router" || type === "workflow" || type === "hybrid";
}

function buildDescription(options) {
  const baseDescription =
    options.description ||
    "Describe what this skill does. Invoke when the user asks for this workflow or needs this capability.";
  const invokeWhen = options.invokeWhen?.trim();

  if (!invokeWhen) {
    return baseDescription;
  }

  if (baseDescription.includes("Invoke when")) {
    return baseDescription;
  }

  return `${baseDescription.trim()} ${invokeWhen}`;
}

function frontmatterBlock(options) {
  const description = buildDescription(options).replace(/"/g, '\\"');
  return `---
name: "${options.name}"
description: "${description}"
---
`;
}

function buildKnowledgeTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `${frontmatterBlock(options)}

# ${title}

用来整理某个主题的知识、规范、原则和示例。

## 什么时候调用

- 当用户需要某个领域的知识整理、最佳实践或说明文档时调用
- 当用户要理解概念、规范、边界或常见坑时调用

## 核心内容

- 核心概念
- 原则与最佳实践
- 示例与反例
- 常见坑与误区

## 推荐结构

- 先解释背景和目标
- 再说明概念和原则
- 最后给出示例与注意事项

## 边界

- 这个 skill 主要负责说明和整理
- 如果需要自动执行、下载、部署或落盘，再决定是否增加执行层
`;
}

function buildRouterTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `${frontmatterBlock(options)}

# ${title}

用来判断不同用户意图应该走哪一种模式、供应商或工作流。

## 什么时候调用

- 当用户需求存在多种可能路径时调用
- 当需要先做意图识别，再做模式选择时调用

## 主要路由任务

- 识别用户目标
- 判断适合的模式或路线
- 说明为什么这样选
- 提供下一步动作

## 模式选择

- 模式 A：适合场景 1
- 模式 B：适合场景 2
- 模式 C：适合场景 3

## 常见请求

- “我该选哪种方案”
- “这个需求更适合哪种模式”
- “帮我判断该走哪条路”

## 边界

- 这个 skill 主要负责判断和分流
- 如果某条路径需要稳定执行，再决定是否补充脚本层
`;
}

function buildWorkflowTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `${frontmatterBlock(options)}

# ${title}

用来把一个较长的任务拆成清晰的阶段和交付流程。

## 什么时候调用

- 当任务不是单一步骤，而是多阶段工作流时调用
- 当结果不仅是回答，还需要交付文件、结果或后续动作时调用

## 输入与输出

- 输入：用户目标、上下文、约束、已有材料
- 输出：阶段性结果与最终交付物

## 工作流阶段

1. 发现需求与约束
2. 设计处理方案
3. 生成或执行
4. 复核与交付

## 回退策略

- 需求不清晰时先补澄清问题
- 结果不稳定时先缩小范围再重试

## 边界

- 这个 skill 主要负责阶段化编排
- 如果某个阶段需要稳定执行，再决定是否加入 scripts/
`;
}

function buildExecutorTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `${frontmatterBlock(options)}

# ${title}

用来执行具体命令、脚本或 API 调用，并交付结果。

## 什么时候调用

- 当用户不仅要建议，还要真正执行任务时调用
- 当任务涉及命令、脚本、API 或文件落地时调用

## 执行前准备

- 说明依赖、环境变量或前置条件
- 说明输入参数和来源

## 执行入口

- CLI 或脚本命令入口
- 参数说明
- 输出说明

## 错误处理

- 认证失败
- 参数缺失
- 远程调用失败
- 输出不完整

## 边界

- 这个 skill 的核心价值在执行闭环
- 如果只需要说明，不一定要保留执行层
`;
}

function buildHybridTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `${frontmatterBlock(options)}

# ${title}

这是一个混合型 skill，同时负责判断、编排和必要的执行落地。

## 什么时候调用

- 当用户需求包含多种意图，需要先判断再执行时调用
- 当任务既有说明层，也有工作流和执行层时调用

## 判断层

- 判断用户当前属于哪一种意图
- 判断应该走说明、工作流还是执行路径
- 判断什么时候需要澄清，什么时候可以直接开始

## Workflow 层

1. 收集目标、上下文和约束
2. 选择最合适的模式或流程
3. 生成中间结果与最终交付

## 执行层

- 如果需要脚本、CLI、API 或文件落地，再进入执行层
- 执行层负责参数适配、错误处理、结果交付
- 不要把执行层逻辑混进判断层说明里

## 典型模式

- 模式 A：先判断，再给策略
- 模式 B：先判断，再走工作流
- 模式 C：先判断，再执行并交付

## 边界与注意事项

- 不要把所有任务都做成重型结构
- 先判断是否真的需要 scripts/ 和 references/
- 保持结构清晰，避免混淆业务能力与执行层能力
`;
}

function buildSkillTemplate(options) {
  switch (options.resolvedType) {
    case "knowledge":
      return buildKnowledgeTemplate(options);
    case "router":
      return buildRouterTemplate(options);
    case "workflow":
      return buildWorkflowTemplate(options);
    case "executor":
      return buildExecutorTemplate(options);
    default:
      return buildHybridTemplate(options);
  }
}

function buildKnowledgeReferenceTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `# ${title} Reference

## Concepts

- Add the core concepts this skill should explain
- Record key principles and best practices

## Example Topics

- Topic 1
- Topic 2
- Topic 3

## Notes

- Keep examples and anti-patterns here
- Avoid putting execution logic in this reference file
`;
}

function buildRouterReferenceTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `# ${title} Routing Notes

## Routing Signals

- Add the user intents this skill should detect
- Record the phrases or requirements that should map to each route

## Route Matrix

- Route A -> Use when ...
- Route B -> Use when ...
- Route C -> Use when ...

## Notes

- Record selection rules and fallback logic here
- Keep this file focused on decision rules, not execution details
`;
}

function buildWorkflowReferenceTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `# ${title} Workflow Notes

## Workflow Stages

- Stage 1
- Stage 2
- Stage 3

## Inputs and Outputs

- Record what each stage receives
- Record what each stage should produce

## Failure and Fallback

- Add retry, rollback, or clarification rules here
- Keep long process notes here instead of bloating SKILL.md
`;
}

function buildExecutorReferenceTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `# ${title} Execution Notes

## Runtime Requirements

- Required environment variables
- Required tools or APIs

## Command and Output Conventions

- Input parameter mapping
- Output files or response shape

## Notes

- Put operational notes, edge cases, and integration details here
- Keep execution behavior aligned with scripts/
`;
}

function buildHybridReferenceTemplate(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  return `# ${title} Hybrid Notes

## Decision Layer

- Record intent categories and routing rules here

## Workflow Layer

- Record the staged process and expected outputs here

## Execution Layer

- Record script, API, or integration notes here

## Notes

- Use this file to keep the hybrid design coherent and avoid mixing layers
`;
}

function buildReferenceTemplate(options) {
  switch (options.resolvedType) {
    case "knowledge":
      return buildKnowledgeReferenceTemplate(options);
    case "router":
      return buildRouterReferenceTemplate(options);
    case "workflow":
      return buildWorkflowReferenceTemplate(options);
    case "executor":
      return buildExecutorReferenceTemplate(options);
    default:
      return buildHybridReferenceTemplate(options);
  }
}

function buildScriptTemplate(options) {
  switch (options.resolvedType) {
    case "knowledge":
      return buildKnowledgeScriptTemplate(options);
    case "router":
      return buildRouterScriptTemplate(options);
    case "workflow":
      return buildWorkflowScriptTemplate(options);
    case "executor":
      return buildExecutorScriptTemplate(options);
    default:
      return buildHybridScriptTemplate(options);
  }
}

function buildKnowledgeScriptTemplate(options) {
  const functionName = options.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `export function ${functionName}Knowledge(input = {}) {
  return {
    ok: true,
    mode: "knowledge",
    message: "Replace this scaffold with knowledge aggregation or formatting logic.",
    concepts: [],
    input,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\\\/g, "/"))) {
  console.log(
    JSON.stringify(
      ${functionName}Knowledge({
        note: "Executed from knowledge scaffold.",
      }),
      null,
      2,
    ),
  );
}
`;
}

function buildRouterScriptTemplate(options) {
  const functionName = options.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `export function ${functionName}Route(input = {}) {
  return {
    ok: true,
    mode: "router",
    selectedRoute: "route-a",
    reason: "Replace this with real route selection logic.",
    input,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\\\/g, "/"))) {
  console.log(
    JSON.stringify(
      ${functionName}Route({
        note: "Executed from router scaffold.",
      }),
      null,
      2,
    ),
  );
}
`;
}

function buildWorkflowScriptTemplate(options) {
  const functionName = options.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `export function ${functionName}Workflow(input = {}) {
  return {
    ok: true,
    mode: "workflow",
    stages: [
      "discover",
      "plan",
      "execute",
      "review",
    ],
    message: "Replace this scaffold with staged workflow logic.",
    input,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\\\/g, "/"))) {
  console.log(
    JSON.stringify(
      ${functionName}Workflow({
        note: "Executed from workflow scaffold.",
      }),
      null,
      2,
    ),
  );
}
`;
}

function buildExecutorScriptTemplate(options) {
  const functionName = options.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `export function ${functionName}Execute(input = {}) {
  return {
    ok: true,
    mode: "executor",
    message: "Replace this scaffold with real execution logic.",
    output: null,
    input,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\\\/g, "/"))) {
  console.log(
    JSON.stringify(
      ${functionName}Execute({
        note: "Executed from executor scaffold.",
      }),
      null,
      2,
    ),
  );
}
`;
}

function buildHybridScriptTemplate(options) {
  const functionName = options.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `export function ${functionName}Hybrid(input = {}) {
  return {
    ok: true,
    mode: "hybrid",
    decision: "route-a",
    workflowStage: "discover",
    message: "Replace this scaffold with decision + workflow + execution logic.",
    input,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\\\/g, "/"))) {
  console.log(
    JSON.stringify(
      ${functionName}Hybrid({
        note: "Executed from hybrid scaffold.",
      }),
      null,
      2,
    ),
  );
}
`;
}

function buildLicenseContent() {
  return `MIT License

Copyright (c) ${new Date().getFullYear()}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function resolveRepoName(options) {
  return options.repoName || options.name;
}

function normalizeRepoUrl(repoUrl) {
  if (!repoUrl) return null;
  return String(repoUrl).trim();
}

function buildGitHubRepoUrl(owner, repoName) {
  return `https://github.com/${owner}/${repoName}`;
}

function buildRepositoryField(options) {
  const repoUrl = normalizeRepoUrl(options.repoUrl);
  const repoName = resolveRepoName(options);
  if (repoUrl) {
    return {
      type: "git",
      url: repoUrl.endsWith(".git") ? repoUrl : `${repoUrl}.git`,
    };
  }

  if (options.repoOwner) {
    return {
      type: "git",
      url: `${buildGitHubRepoUrl(options.repoOwner, repoName)}.git`,
    };
  }

  return undefined;
}

function resolveInstallSource(options) {
  const repoUrl = normalizeRepoUrl(options.repoUrl);
  const repoName = resolveRepoName(options);
  if (repoUrl) return repoUrl;
  if (options.repoOwner) return `${options.repoOwner}/${repoName}`;
  return "<owner-or-url>";
}

function buildInstallSnippets(options) {
  const packageName = options.name;
  const targets = options.agentTargets ?? [];
  const installSource = resolveInstallSource(options);
  const defaultSnippet = `npx skills add ${installSource} --skill ${packageName}`;
  const targetedSnippets =
    targets.length === 0
      ? []
      : targets.map((target) => `npx skills add ${installSource} --skill ${packageName} --agent ${target}`);

  return {
    installSource,
    defaultSnippet,
    targetedSnippets,
  };
}

function buildReadmeNotes(options) {
  const notes = [];
  if (!options.repoOwner && !options.repoUrl) {
    notes.push("- Replace install source with your real GitHub repo or local path before publishing.");
  } else {
    notes.push("- Install snippets already point to the configured repository source.");
  }
  notes.push("- Review `SKILL.md`, `scripts/`, and `references/` before publishing.");
  return notes.join("\n");
}

function buildCommonReadmeSections(options) {
  const title = options.title?.trim() || toTitleCase(options.name);
  const { defaultSnippet, targetedSnippets } = buildInstallSnippets(options);
  const extraSnippets =
    targetedSnippets.length === 0
      ? "- Agent target examples: add `--agent <agent-name>` when publishing to specific agents."
      : targetedSnippets.map((snippet) => `- \`${snippet}\``).join("\n");

  return {
    title,
    description: buildDescription(options),
    defaultSnippet,
    extraSnippets,
    notes: buildReadmeNotes(options),
  };
}

function renderMinimalReadme(sections) {
  return `# ${sections.title}

${sections.description}

\`\`\`bash
${sections.defaultSnippet}
\`\`\`

${sections.bestFor}
`;
}

function renderOpenSourceReadme(sections) {
  return `# ${sections.title}

${sections.description}

## Install

\`\`\`bash
${sections.defaultSnippet}
\`\`\`

## Best For

${sections.bestFor}

## Agent Targets

${sections.extraSnippets}

## Structure

${sections.structure}

## Notes

${sections.notes}
`;
}

function renderCommunityReadme(sections) {
  return `# ${sections.title}

${sections.description}

## Why This Skill

${sections.highlights}

## Install

\`\`\`bash
${sections.defaultSnippet}
\`\`\`

## Community Scenarios

${sections.bestFor}

## Agent Targets

${sections.extraSnippets}

## Project Layout

${sections.structure}

## Publishing Notes

${sections.notes}
`;
}

function renderReadmeByStyle(sections, style) {
  switch (style) {
    case "minimal":
      return renderMinimalReadme(sections);
    case "community":
      return renderCommunityReadme(sections);
    default:
      return renderOpenSourceReadme(sections);
  }
}

function buildKnowledgeReadme(options) {
  const common = buildCommonReadmeSections(options);
  return renderReadmeByStyle(
    {
      ...common,
      bestFor: `- Knowledge guides\n- Reference material\n- Best practices and anti-pattern collections`,
      structure: `- \`SKILL.md\`\n- \`references/\` for concepts, examples, and best practices\n- Optional \`scripts/\` when formatting or aggregation is needed`,
      highlights: `- Explains concepts clearly\n- Organizes principles and examples\n- Keeps reference material easy to maintain`,
    },
    options.publishReadmeStyle,
  );
}

function buildRouterReadme(options) {
  const common = buildCommonReadmeSections(options);
  return renderReadmeByStyle(
    {
      ...common,
      bestFor: `- Intent routing\n- Model or provider selection\n- Scenario-based path selection`,
      structure: `- \`SKILL.md\`\n- \`references/\` for route matrix and routing rules\n- Optional \`scripts/\` for route evaluation helpers`,
      highlights: `- Helps agents choose the right path\n- Makes route selection explicit\n- Keeps decision rules out of business logic`,
    },
    options.publishReadmeStyle,
  );
}

function buildWorkflowReadme(options) {
  const common = buildCommonReadmeSections(options);
  return renderReadmeByStyle(
    {
      ...common,
      bestFor: `- Multi-stage tasks\n- Analyze -> generate -> review flows\n- Structured delivery workflows`,
      structure: `- \`SKILL.md\`\n- \`references/\` for stages, inputs, outputs, and fallbacks\n- Optional \`scripts/\` for stage execution helpers`,
      highlights: `- Breaks complex work into stages\n- Makes inputs and outputs explicit\n- Improves delivery consistency`,
    },
    options.publishReadmeStyle,
  );
}

function buildExecutorReadme(options) {
  const common = buildCommonReadmeSections(options);
  return renderReadmeByStyle(
    {
      ...common,
      bestFor: `- CLI or script execution\n- API wrappers\n- File-based delivery and automation`,
      structure: `- \`SKILL.md\`\n- \`scripts/\` for execution logic\n- Optional \`references/\` for runtime notes and integration details`,
      highlights: `- Turns guidance into execution\n- Wraps runtime behavior cleanly\n- Supports stable automation and delivery`,
    },
    options.publishReadmeStyle,
  );
}

function buildHybridReadme(options) {
  const common = buildCommonReadmeSections(options);
  return renderReadmeByStyle(
    {
      ...common,
      bestFor: `- Complex skills with decision, workflow, and execution layers\n- Long-running or multi-mode skills\n- Product-like skills with delivery loops`,
      structure: `- \`SKILL.md\`\n- \`scripts/\` for execution layer helpers\n- \`references/\` for decision rules, workflow notes, and execution notes`,
      highlights: `- Combines routing, workflows, and execution\n- Supports richer product-like skills\n- Keeps layered responsibilities clear`,
    },
    options.publishReadmeStyle,
  );
}

function buildReadmeContent(options) {
  switch (options.resolvedType) {
    case "knowledge":
      return buildKnowledgeReadme(options);
    case "router":
      return buildRouterReadme(options);
    case "workflow":
      return buildWorkflowReadme(options);
    case "executor":
      return buildExecutorReadme(options);
    default:
      return buildHybridReadme(options);
  }
}

function buildPackageJsonContent(options) {
  const repository = buildRepositoryField(options);
  const typeKeywordsMap = {
    knowledge: ["knowledge-base", "reference", "best-practices"],
    router: ["router", "decision-engine", "selection"],
    workflow: ["workflow", "orchestration", "delivery"],
    executor: ["executor", "automation", "cli-wrapper"],
    hybrid: ["hybrid", "meta-skill", "workflow-executor"],
  };
  const packageJson = {
    name: options.name,
    version: "0.1.0",
    private: false,
    description: buildDescription(options),
    license: "MIT",
    keywords: ["skill", "agent-skill", options.resolvedType, options.name, ...(typeKeywordsMap[options.resolvedType] || [])],
  };

  if (repository) {
    packageJson.repository = repository;
  }

  if (options.repoOwner && !options.repoUrl) {
    packageJson.homepage = buildGitHubRepoUrl(options.repoOwner, resolveRepoName(options));
  }

  if (options.repoUrl) {
    packageJson.homepage = options.repoUrl;
  }

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

async function safeExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeTextFile(filePath, content, force) {
  const exists = await safeExists(filePath);
  if (exists && !force) {
    throw new Error(`${path.basename(filePath)} already exists at ${filePath}. Use --force to overwrite.`);
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help || options.h) {
    printHelp();
    return;
  }

  if (!options.name) {
    throw new Error("Missing required --name.");
  }

  if (!ensureKebabCase(options.name)) {
    throw new Error("`--name` must be kebab-case, e.g. weekly-report-skill.");
  }

  const resolvedType = inferSkillType(options);
  const createScripts = shouldCreateScripts(resolvedType, options.withScripts);
  const createReferences = shouldCreateReferences(resolvedType, options.withReferences);
  const targetRoot = path.resolve(options.targetRoot || process.cwd());
  const publishable = Boolean(options.publishable);
  const agentTargets = parseAgentTargets(options.agentTarget);
  const publishReadmeStyle = normalizeReadmeStyle(options.publishReadmeStyle);
  const skillDir = publishable
    ? path.join(targetRoot, options.name)
    : path.join(targetRoot, ".trae", "skills", options.name);
  const skillFile = path.join(skillDir, "SKILL.md");
  const scriptFile = path.join(skillDir, "scripts", `${options.name}.js`);
  const referenceFile = path.join(skillDir, "references", "overview.md");
  const readmeFile = path.join(skillDir, "README.md");
  const licenseFile = path.join(skillDir, "LICENSE");
  const packageJsonFile = path.join(skillDir, "package.json");
  const resolvedOptions = { ...options, resolvedType, publishable, agentTargets, publishReadmeStyle };

  await fs.mkdir(skillDir, { recursive: true });
  await writeTextFile(skillFile, buildSkillTemplate(resolvedOptions), options.force);

  if (createScripts) {
    await writeTextFile(scriptFile, buildScriptTemplate(resolvedOptions), options.force);
  }

  if (createReferences) {
    await writeTextFile(referenceFile, buildReferenceTemplate(resolvedOptions), options.force);
  }

  if (publishable) {
    await writeTextFile(readmeFile, buildReadmeContent(resolvedOptions), options.force);
    await writeTextFile(licenseFile, buildLicenseContent(), options.force);
    await writeTextFile(packageJsonFile, buildPackageJsonContent(resolvedOptions), options.force);
  }

  console.log(
    JSON.stringify(
      {
        created: true,
        skillName: options.name,
        skillType: resolvedType,
        publishable,
        withScripts: createScripts,
        withReferences: createReferences,
        skillDir,
        skillFile,
        scriptFile: createScripts ? scriptFile : null,
        referenceFile: createReferences ? referenceFile : null,
        readmeFile: publishable ? readmeFile : null,
        licenseFile: publishable ? licenseFile : null,
        packageJsonFile: publishable ? packageJsonFile : null,
        agentTargets,
        publishReadmeStyle,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
