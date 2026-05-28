# My Skill Builder

[中文主页](./README.md) | [English](./README.en.md)

`my-skill-builder` 是一个面向开发者的 meta-skill，用来把一个模糊想法逐步收敛成完整可用的 skill。它不只是生成 `SKILL.md`，还会帮助判断 skill 类型、决定是否需要 `scripts/` 与 `references/`，并生成可发布的标准 skill 包结构。

## 它解决什么问题

- 只有一个大概想法，不知道该做成哪类 skill
- 不确定是知识型、路由型、工作流型、执行器型，还是混合型
- 不清楚什么时候需要 `CLI`、`scripts/`、`references/`
- 想快速产出一个能安装、能发布、能继续迭代的 skill 包

## 核心能力

- 模糊需求澄清：把一句想法收敛成结构化需求
- skill 类型判断：支持 `knowledge`、`router`、`workflow`、`executor`、`hybrid`
- 类型化骨架生成：按类型输出不同的 `SKILL.md`
- 类型化参考文档：按类型生成 `references/overview.md`
- 类型化脚本模板：按类型生成不同 `scripts/` 骨架
- 发布包生成：支持输出 `README.md`、`LICENSE`、`package.json`
- 安装片段生成：支持 `--repo-owner`、`--repo-name`、`--repo-url`
- README 风格切换：支持 `minimal`、`open-source`、`community`

## 安装

```bash
npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder
```

指定 agent：

```bash
npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder --agent codex
npx skills add Damond-Fung/my-skill-builder --skill my-skill-builder --agent cursor
```

## 最简单的使用方式

```bash
node ./scripts/scaffold-skill.js --name weekly-report-skill
```

## 类型说明

### knowledge

- 适合：规范、指南、参考资料、最佳实践
- 默认输出：`SKILL.md` + `references/overview.md`

### router

- 适合：模型选择、供应商选择、场景分流
- 默认输出：`SKILL.md` + `references/overview.md`

### workflow

- 适合：多阶段任务，例如分析 -> 生成 -> 复核 -> 交付
- 默认输出：`SKILL.md` + `references/overview.md`

### executor

- 适合：脚本、CLI、API 执行类 skill
- 默认输出：`SKILL.md` + `scripts/<skill-name>.js`

### hybrid

- 适合：同时包含判断层、工作流层、执行层的复杂 skill
- 默认输出：`SKILL.md` + `scripts/<skill-name>.js` + `references/overview.md`

## 标准发布包

当传入 `--publishable` 时，会生成如下标准结构：

```text
<target-root>/<skill-name>/
├── README.md
├── README.en.md
├── LICENSE
├── package.json
├── SKILL.md
├── scripts/
└── references/
```

## 仓库内容

- `SKILL.md`：核心 skill 定义
- `scripts/scaffold-skill.js`：scaffold 执行层
- `references/overview.md`：hybrid 结构参考说明
- `README.md`：中文主页
- `README.en.md`：英文说明
- `package.json`：发布元信息
- `dist/my-skill-builder-skill-package.zip`：标准 skill 包压缩文件

## 标准 skill 包 zip

压缩包包含以下内容：

- `SKILL.md`
- `README.md`
- `README.en.md`
- `LICENSE`
- `package.json`
- `scripts/`
- `references/`

适合直接下载后解压，或作为标准 skill 目录分发。

## 说明

- 这个仓库是单 skill 标准包结构，不是多 skill 集合仓库
- 如果只想本地使用，可以直接 `npx skills add` 指向 GitHub 仓库或本地目录
- 如果想继续增强，可以在 `scripts/scaffold-skill.js` 上追加更复杂的脚手架能力
