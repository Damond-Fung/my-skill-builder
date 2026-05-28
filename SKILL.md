---
name: "my-skill-builder"
displayName: "My Skill Builder"
allowed-tools: Bash(node *)
description: "Builds complete custom skills from rough ideas. Invoke when a user wants to create, structure, refine, scaffold, or publish a skill with the right template and execution layer."
---

# My Skill Builder

把一个模糊想法，逐步做成一个完整可用的 skill�?
这个 skill 不是简单生�?`SKILL.md` 的模板填空器，而是一个面向开发者的 **Skill 设计�?+ 结构判断�?+ 脚手架规划器**。它负责先判断“这到底应该做成哪一�?skill”，再决定是否需要执行层，最后产出合适的 skill 包�?
## 核心目标

在一次完整的构建流程中，完成这些事情�?
- 把模糊需求收敛成结构�?skill 需�?- 判断 skill 类型，而不是直接套模板
- 判断是否需�?`CLI`、`scripts/`、`references/`、`MCP`、外�?API 适配�?- 生成符合标准结构�?skill �?- 在动手前优先查看已有 skill，尽量迭代而不是重复造轮�?- 让最终产物既能触发，也能执行，也便于后续维护

## 什么叫“完整可用的 meta-skill�?
这里的“meta-skill”指的是�?*它不是直接解决某个业务问题，而是负责设计、生成、重构其�?skill**�?
“完整可用”至少包含四层能力：

- **会判�?*
  - 能先判断这是什么类型的 skill，而不是直接套模板
- **会澄�?*
  - 能通过少量关键问题，把模糊想法收敛成结构化需�?- **会产�?*
  - 能给�?skill 蓝图、完�?`SKILL.md`，必要时还能补执行层
- **会落�?*
  - 能真正生成最小可用的目录和初始文件，而不是只停留在建议层

当前这版已经具备前三层，并补上了一个很薄的 scaffold 执行层，用来自动创建�?skill 的目录和初始 `SKILL.md`�?
## Scaffold 执行�?
如果当前任务已经足够明确，需要直接生成一个新 skill 的初始骨架，可以使用本地 scaffold 脚本。当前版本支持：

- �?skill 类型自动选择骨架
- 自动判断是否生成 `scripts/`
- 自动判断是否生成 `references/`
- 为不同类型生成不同初�?`SKILL.md`
- 支持 `--publishable` 直接生成可发�?skill 包结�?
最简单的用法�?
```bash
node ./scripts/scaffold-skill.js --name weekly-report-skill
```

常用参数�?
- `--name`: 必填，skill 名称，要�?kebab-case
- `--type`: 可选，`knowledge | router | workflow | executor | hybrid | auto`
- `--title`: 可选，生成�?Markdown 标题
- `--description`: 可选，frontmatter 描述
- `--invoke-when`: 可选，补充“什么时候调用”的语句
- `--agent-target`: 可选，逗号分隔�?agent 目标，用于生成安装说明片�?- `--repo-owner`: 可选，GitHub owner，用于生成真实安装片�?- `--repo-name`: 可选，仓库名，默认等于 skill �?- `--repo-url`: 可选，完整 git �?GitHub URL，用于生成真实安装片�?- `--publish-readme-style`: 可选，`minimal | open-source | community`
- `--with-scripts`: 可选，`auto | true | false`
- `--with-references`: 可选，`auto | true | false`
- `--publishable`: 可选，生成�?skill 发布包根结构
- `--target-root`: 可选，指定生成目标根目�?- `--force`: 可选，覆盖已有 `SKILL.md`

默认会根据名称、标题、描述和触发说明推断 skill 类型；也可以手动指定 `--type`�?
自动生成规则�?
- `knowledge`: 默认生成 `SKILL.md` + `references/overview.md`
- `router`: 默认生成 `SKILL.md` + `references/overview.md`
- `workflow`: 默认生成 `SKILL.md` + `references/overview.md`
- `executor`: 默认生成 `SKILL.md` + `scripts/<skill-name>.js`
- `hybrid`: 默认生成 `SKILL.md` + `scripts/<skill-name>.js` + `references/overview.md`

生成内容包括�?
- `.trae/skills/<skill-name>/SKILL.md`
- 按类型生成的章节骨架
- 可�?`scripts/` 初始执行文件，且按类型输出不同骨�?- 可�?`references/overview.md`，且内容按类型变�?- `--publishable` 下的 `README.md`、`LICENSE`、`package.json`

`references/overview.md` 现在也会按类型输出不同模板：

- `knowledge`: 概念、原则、示例主�?- `router`: 路由信号、route matrix、选择规则
- `workflow`: 阶段说明、输入输出、回退策略
- `executor`: 运行要求、命令约定、集成说�?- `hybrid`: 判断层、workflow 层、执行层说明

`scripts/` 现在也会按类型输出不同骨架：

- `knowledge`: 知识整理或格式化入口
- `router`: 路由选择入口
- `workflow`: 分阶�?workflow 入口
- `executor`: 真正执行任务的入�?- `hybrid`: 判断 + workflow + 执行的组合入�?
`README.md` 也会按类型变化：

- `knowledge`: 更强调知识整理、最佳实践、参考资�?- `router`: 更强调路由、选择、route matrix
- `workflow`: 更强调阶段化流程和交�?- `executor`: 更强调执行入口、脚本和自动�?- `hybrid`: 更强调判断层 + workflow �?+ 执行�?
同时还支�?3 种发�?README 风格�?
- `minimal`: 极简版，适合内部分享或快速发�?- `open-source`: 开源版，适合标准仓库说明
- `community`: 社区展示版，适合强调亮点和使用场�?
`hybrid` 类型�?`SKILL.md` 也不再是简单混合说明，而是显式拆成�?
- 判断�?- workflow �?- 执行�?
当传�?`--publishable` 时，输出结构会从本地安装用的�?
```text
.trae/skills/<skill-name>/
```

切换成单 skill 可发布包结构�?
```text
<target-root>/<skill-name>/
├── README.md
├── LICENSE
├── package.json
├── SKILL.md
├── scripts/
└── references/
```

�?`--publishable` 下，还会生成�?
- 最�?`README.md`
- `LICENSE`
- `package.json`
- �?`--agent-target` 的安装说明片�?
当提供：

- `--repo-owner your-name`
- `--repo-name custom-repo`
- �?`--repo-url https://github.com/your-name/your-skill`

安装片段会从占位�?`<owner-or-url>` 变成真实地址�?
`package.json` 也会根据类型补充不同 `keywords`，更接近真实开源包的元信息�?
这个脚本仍然保持“轻�?scaffold”定位：它不会直接生成完整业务逻辑、复�?CLI 或完整发布仓库文档体系。那些能力仍然应该在完成类型判断和结构设计之后，再决定是否补充�?
### 类型�?scaffold 示例

知识型：

```bash
node ./scripts/scaffold-skill.js \
  --name api-guide-skill \
  --type knowledge
```

执行器型�?
```bash
node ./scripts/scaffold-skill.js \
  --name deploy-runner \
  --type executor
```

自动判型�?
```bash
node ./scripts/scaffold-skill.js \
  --name weekly-report-builder \
  --description "Builds weekly reports from meeting notes and task context."
```

可发布包�?
```bash
node ./scripts/scaffold-skill.js \
  --name publishable-router \
  --type router \
  --publishable \
  --agent-target codex,cursor \
  --repo-owner your-name \
  --repo-name my-router-repo \
  --publish-readme-style community \
  --target-root ./publish
```

## 什么时候调用这�?skill

当用户出现下面这些意图时，优先调用：

- “我想做一�?skill，但是还只有一个大概想法�?- “帮我设计一个完整可用的 skill�?- “这个需求应该做成什么类型的 skill�?- “帮我给这个 skill 设计结构、触发词和能力边界�?- “这�?skill 需不需�?CLI / MCP / 脚本层�?- “帮我把现有 skill 重构成更完整的版本�?- “帮我把一�?skill 打包成标准包并准备发布�?
如果用户只是想新增一个非常简单的单命�?skill，这�?skill 也可以用，但要主动判断是否应该降级为轻量结构，避免过度设计�?
## 不要做的�?
- 不要一上来就写文件，先判断 skill 类型和复杂度
- 不要默认所�?skill 都需�?`Route 1/2/3/4`
- 不要默认所�?skill 都需�?`CLI`
- 不要为了“看起来完整”而添加无价值的 `references/` 或脚�?- 不要机械复刻别的 skill 的栏目名、节奏和文案风格
- 不要在没有必要时创建额外文件

## 先做三层判断

每次开始时，先完成下面三层判断，再进入生成阶段�?
### 第一层：任务类型判断

先判断它属于哪类 skill�?
1. **知识�?Skill**
   - 主要产出：概念说明、原则、最佳实践、示例、常见坑
   - 适合：规范、API 指南、设计原则、领域知�?   - 通常：只需�?`SKILL.md`

2. **路由�?Skill**
   - 主要产出：意图识别、模式选择、路径分�?   - 适合：多模型、多供应商、多使用场景的任�?   - 通常：`SKILL.md` 为主，可选执行层

3. **工作流型 Skill**
   - 主要产出：从输入到交付的完整过程
   - 适合：分�?-> 生成 -> 导出 -> 交付 这类链路较长的任�?   - 通常：需要更清晰的阶段设计，可能需要脚本层

4. **执行器型 Skill**
   - 主要产出：脚本、CLI、MCP 调用、自动化落地
   - 适合：核心价值在命令执行、文件处理、API 封装
   - 通常：`scripts/` �?CLI 是主角，`SKILL.md` 负责触发和路�?
5. **混合�?Skill**
   - 同时包含路由、工作流、执行层
   - 适合：复杂、可交付、长期维护的 skill

### 第二层：复杂度判�?
判断应该做成哪一个交付级别：

- **Level 1: Blueprint**
  - 只输�?skill 蓝图、能力树、推荐结�?  - 适合：用户还在探索方�?
- **Level 2: Skill Doc**
  - 输出完整 `SKILL.md`
  - 适合：知识型 skill、轻量路由型 skill

- **Level 3: Executable Skill**
  - 输出 `SKILL.md` + 必要脚本骨架
  - 适合：需�?CLI、API、文件落地、自动交�?
- **Level 4: Publishable Package**
  - 输出可安装、可发布、可分享的标�?skill �?  - 适合：准备上传仓库或对外分发

### 第三层：执行层判�?
判断要不要加执行层：

- **只用 `SKILL.md`**
  - �?skill 主要是说明、判断、指导、路�?
- **`SKILL.md` + `references/`**
  - 当存在长文说明、复杂流程、外部规范、对比材�?
- **`SKILL.md` + `scripts/`**
  - 当需要封装命令、API、下载、转换、结果保�?
- **`SKILL.md` + `scripts/` + provider adapter**
  - �?skill 需要对接外部模型或多个服务

只有在执行层真正能提升稳定性、复用性、交付闭环时，才建议增加脚本�?
## 标准工作�?
按照下面的顺序推进，不要跳步�?
### Phase A: Discover

把用户的模糊想法收集成结构化信息�?
- 这个 skill 是给谁用
- 最终解决什么问�?- 输出是回答、文件、页面、报告、脚本，还是自动执行结果
- 是单步动作还是多步工作流
- 是否已有外部 API、网站、MCP、CLI、脚本可以复�?- 是否已有现有 skill 或相近实现可迭代

如果信息缺失较多，先提出少量高价值澄清问题，而不是一次性盘问�?
### Phase B: Classify

基于需求，把它归类到知识型、路由型、工作流型、执行器型、混合型之一�?
输出时必须说明：

- 为什么归到这个类�?- 为什么不选其他类�?- 当前复杂度属于哪�?Level

### Phase C: Design

生成 skill 蓝图，至少包括：

- skill 定位
- 主要用户意图
- 触发条件
- 能力边界
- 主要工作流或模式
- 需要的目录结构
- 是否需要执行层
- 是否需要外部依�?
### Phase D: Scaffold

按需要生成实际产物：

- `.trae/skills/<skill-name>/SKILL.md`
- 可�?`scripts/`
- 可�?`references/`
- 可选发布仓库结�?
优先复用已有文件和模式，避免重复�?
如果只是生成�?skill 的最小起步文件，优先使用本地 scaffold 脚本，而不是手动重复创建目录和 frontmatter�?
### Phase E: Review

完成后必须检查：

- 这个 skill 有没有过度设�?- 触发描述是否足够明确
- 结构是否真的匹配任务本身
- 是否把业务能力和执行层能力混在一�?- 是否存在明显借鉴痕迹而没有形成自己的表达
- 是否有不必要的新文件

## 输出格式要求

无论最终产物是蓝图还是完整 skill，都尽量输出以下结构�?
### 1. Skill Summary

- skill 名称
- skill 类型
- 交付级别
- 主要适用场景
- 是否需要执行层

### 2. Capability Map

从“用户可感知能力”和“执行层能力”两部分拆开�?
- **用户可感知能�?*
  - 例如：生成、分析、改写、导出、整理、排�?
- **执行层能�?*
  - 例如：CLI 封装、API 调用、下载、解析、缓存、结果落�?
不要�?CLI 本身当成业务能力�?
### 3. Structure Plan

明确建议的目录结构，例如�?
```text
.trae/skills/<skill-name>/
└── SKILL.md
```

或：

```text
<repo-root>/
├── SKILL.md
├── scripts/
�?  └── tool.mjs
└── references/
    └── workflow.md
```

### 4. Build Decision

明确说明�?
- 为什么这样设�?- 为什么不需要更复杂的结�?- 如果未来扩展，最自然的下一步是什�?
## 结构设计规则

不是所�?skill 都要用同一套章节。根据类型选择更自然的结构�?
### 知识�?Skill 推荐结构

- 简�?- 适用时机
- 核心概念
- 原则 / 最佳实�?- 示例
- 常见�?
### 路由�?Skill 推荐结构

- 简�?- 什么时候触�?- 模式选择说明
- 场景分流
- 常见请求
- 边界 / 风险

### 工作流型 Skill 推荐结构

- 简�?- 输入与输�?- 工作流阶�?- 每个阶段的处理规�?- 最终交�?- 异常与回退路径

### 执行器型 Skill 推荐结构

- 简�?- 执行前准�?- 命令 / 脚本入口
- 参数规范
- 输出规范
- 错误处理

### 混合�?Skill 推荐结构

先写�?
- skill 的核心承�?- 什么时候调�?- 类型判断逻辑

再写�?
- 主要 workflow �?mode
- 执行层设�?- 交付闭环
- 边界与回退策略

## 什么时候要�?CLI

只有满足下面任意一类条件时，才建议设计 CLI�?
- 需要稳定执行外�?API
- 需要统一参数转换
- 需要本地下载、落盘、缓存、转�?- 需要统一错误处理
- 需要把“会讲”升级成“会做�?
下面情况通常不要�?CLI�?
- 只是知识说明
- 只是简�?prompt 指导
- 只是单个命令包装，且没有复用价�?- skill 生命周期很短，且后续不需要维�?
## 触发词设计规�?
触发词不是越多越好，而是要覆盖真实意图�?
必须同时覆盖�?
- 用户目标表达
  - 例如：“帮我做一�?skill�?- 用户问题表达
  - 例如：“这个需求适合什�?skill�?- 用户动作表达
  - 例如：“重构这�?skill”“给这个 skill 加执行层�?- 用户发布表达
  - 例如：“打包成标准 skill 包”“准备发布到 GitHub�?
如果一�?skill 面向多语言用户，可以补充少量英文触发语，但不要堆砌关键词�?
## 能力边界判断规则

在设�?skill 时，必须显式写清楚：

- 这个 skill 最擅长什�?- 这个 skill 不负责什�?- 什么时候应该转去更轻量或更重型的方�?- 什么时候只需�?`SKILL.md`
- 什么时候必须加执行�?
一个优秀 skill 的边界感，和它的能力同样重要�?
## 产物验收标准

最终产物至少要满足这些标准�?
1. **可触�?*
   - description 和正文能清楚表达何时调用

2. **可理�?*
   - 结构不是堆章节，而是能解释清楚设计逻辑

3. **可执�?*
   - 需要执行层时，能落到脚本、CLI、MCP �?API 适配�?
4. **可维�?*
   - 结构不过度复杂，目录干净，扩展路径明�?
5. **可交�?*
   - 如果目标是发布，仓库结构和内容应符合 skill 生态标�?
## 常见构建模式

### Pattern 1: 从模糊想法到 skill 蓝图

适合用户只给一句想法时使用�?
输出�?
- 类型判断
- 能力�?- 推荐目录结构
- 是否需要执行层

### Pattern 2: 从想法到完整 `SKILL.md`

适合方向明确，但还没�?skill 内容时使用�?
输出�?
- 标准 frontmatter
- 主体章节
- 触发�?- 适用时机
- 边界说明

### Pattern 3: �?`SKILL.md` 到可执行 skill

适合已有说明文档，但没有执行闭环时使用�?
输出�?
- 保留原有 skill 定位
- 补充 CLI / `scripts/`
- 补充输出落地
- 补充错误处理

### Pattern 4: 从现�?skill 到发布包

适合已有 skill，准备上传仓库或分发安装时使用�?
输出�?
- 标准仓库结构
- 安装入口
- 使用示例
- 发布说明

## 对话策略

这个 skill 不要变成“连续追问器”，要有节制地问问题�?
优先问最影响结构的问题：

- 输出要回答问题，还是要真正执�?- 用户是否需要长期维�?- 是否已有现成能力可复�?- 是否需要对接外部系�?
当已经足以做出结构判断时，就应该进入产出阶段，不要无限追问�?
## 自检清单

在结束前逐项检查：

- 这个 skill 的类型判断是否合�?- 目录结构是否最小化
- 是否优先复用了现�?skill 和代�?- 是否把执行层放在了合适的位置
- 是否存在明显模板化痕�?- 是否写清楚了边界和回退策略
- 如果涉及打包或发布，是否核对了最新官�?skill 结构要求

## 示例请求

- “我想做一个能把会议纪要整理成周报�?skill，帮我判断结构并生成完整 skill�?- “我现在只有一个模糊方向，帮我把它设计成完整可用的 skill�?- “这�?skill 要不要加 CLI，帮我判断并补全�?- “帮我把现有 skill 重构成更完整、可发布的标准包�?- “给我设计一个工作流�?skill，不要做成模板味太重的版本�?
## 最终原�?
这个 skill 的职责不是“快速生成一份看起来完整的文档”，而是�?
- 先判�?- 再分�?- 再定结构
- 再决定是否需要执行层
- 最后产出真正匹配任务的 skill

如果一个更简单的结构就能解决问题，就不要把它做复杂�?
