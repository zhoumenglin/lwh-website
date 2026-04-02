---
title: "AI 产品经理的工作流到底变了什么"
description: "不确定性不是 AI 产品的缺陷，而是常态。从搜索推荐到大模型生成，拆解概率性设计、效果度量和 Token 经济学背后的产品决策。"
pubDate: "Mar 15 2026"
badge: "工作流"
tags: ["AI产品经理", "产品设计", "工作流"]
---

## 先讲一个具体的场景

假设你是一个工具类 AI 产品的 PM，用户输入"帮我写一封给客户的道歉邮件"，模型生成了一封邮件。你打开一看——语气太正式了，像律师函多过道歉信。

在传统的事务性产品里（电商下单、表单提交），这种情况几乎不会发生——用户点"提交"，系统就执行，输出是确定的。当然，搜索推荐类产品也存在"结果不准"的问题，但那是后台优化，用户感知不强。AI 产品的不同在于：**不确定性的输出直接暴露在用户面前，成为了核心交互体验本身**。

这不是一个技术问题（模型会越来越好），而是一个产品问题：**当 AI 的输出不够好时，用户的体验怎么兜底？** 这个问题的答案，决定了 AI 产品和传统产品在工作流上的根本差异。

## 概率性设计：处理"不确定"是核心技能

传统产品的交互是确定性的。用户操作 A，系统返回 B，每次都一样。PM 的工作是设计这条从 A 到 B 的路径——越清晰越好、越短越好。

AI 产品的交互是概率性的。用户输入 A，模型可能返回 B1、B2 或 B3，哪个都有可能。PM 的工作不再只是设计"成功路径"，**更多的精力要花在设计"不成功时怎么办"上**。

这听起来很抽象，拆成具体的产品决策就清楚了。

**决策一：要不要让用户看到不确定性？**

有两种做法。一种是把不确定性藏起来——模型只输出一个结果，用户要么接受要么手动修改。ChatGPT 早期就是这个思路。另一种是把不确定性暴露出来——给用户"重新生成"按钮、提供多个版本选择、让用户通过追加指令来调整输出。Midjourney 的四宫格就是后一种思路的典型实现[1]。

两种做法各有取舍。藏起来的好处是体验简洁，坏处是用户对质量不满时没有出口；暴露出来的好处是用户有控制感，坏处是增加了交互复杂度和推理成本（每次"重新生成"都在消耗 Token）。

**决策二：兜底机制怎么分层设计？**

不是所有"不够好"的程度都一样。模型输出一封语气偏正式的邮件和模型输出一段完全无关的胡言乱语，需要的兜底策略完全不同。

我在实践中观察到的一种有效分层：

<div class="mermaid">
graph LR
    A{"偏差程度"} -->|"轻度"| B["编辑微调"]
    A -->|"中度"| C["Prompt 引导"]
    A -->|"重度"| D["错误标识 + 来源标注"]
    style B fill:#f0fff4,stroke:#38a169
    style C fill:#fffff0,stroke:#d69e2e
    style D fill:#fff5f5,stroke:#e53e3e
</div>


- **轻度偏差**（方向对，细节不够好）：提供编辑能力，让用户在 AI 输出基础上微调。Notion AI 的做法是生成内容后直接进入编辑态[2]，这比"重新生成"更高效。
- **中度偏差**（方向有偏，需要引导）：提供 Prompt 优化建议。比如系统检测到用户的输入太模糊，主动提问"你希望语气更正式还是更随意？"来收窄输出空间。
- **重度偏差**（输出明显错误或产生幻觉）：需要有明确的错误标识和反馈机制。Perplexity 在回答中标注信息来源[3]，让用户自己判断可信度，就是一种把质量判断权交还用户的设计。

这种分层兜底的思维方式，和搜索推荐产品处理"推荐不准"的逻辑是相通的。搜索推荐的本质也是预测——系统预测用户想要什么。当预测不准时，产品的应对策略同样需要分层：轻度偏差靠排序优化解决，中度偏差靠刷新机制和"换一批"来兜底，重度偏差（搜索无结果）需要有明确的空态设计和推荐引导。

**核心原则是一样的：不确定性不是需要消除的 bug，而是需要被产品化地管理的常态。**

## 效果度量：传统指标不够用了

传统产品的核心指标体系大家都很熟悉——DAU、留存率、转化率、ARPU。这些指标在 AI 产品中依然重要，但远远不够。

**AI 产品需要增加一整套"输出质量"维度的指标。** 具体包括：

**准确率（Accuracy）。** 模型的输出在多大比例上是正确的、有用的。对于搜索类 AI 产品（如 Perplexity），这直接决定产品口碑。Google 内部对 Bard（现 Gemini）的评估中，factual accuracy 是权重最高的指标之一[4]。

**幻觉率（Hallucination Rate）。** 模型在多大比例上生成了看似合理但实际上错误的内容。这是 AI 产品最致命的质量问题——比"不够好"更危险的是"错了但看起来是对的"。根据 Vectara 的研究，主流大模型的幻觉率在 3%-27% 之间[5]，差异巨大。PM 需要理解自己产品的幻觉率水位在哪里，并据此设计防御策略。

**首 Token 延迟（Time to First Token）。** 用户输入指令后多久能看到第一个输出字符。ChatGPT 用流式输出（Streaming）来缓解感知延迟[6]，这是一个纯产品层面的决策——模型的实际推理时间没变，但用户的等待感受完全不同。

**用户满意度。** 很多 AI 产品在输出下方加了"赞/踩"按钮，但据我观察大部分用户懒得点。更有效的衡量方式是看行为信号：用户是否直接使用了 AI 的输出？是否做了大量编辑？是否直接关闭了对话？这些隐式反馈比显式评分更真实。

<div class="design-figure">
<div class="design-figure__title">AI 产品效果度量指标体系</div>
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, sans-serif;">
  <!-- Center -->
  <circle cx="300" cy="140" r="45" fill="#e0f2f1" stroke="#4db6ac" stroke-width="2"/>
  <text x="300" y="135" text-anchor="middle" font-size="11" font-weight="600" fill="#2d3748">用户体验</text>
  <text x="300" y="150" text-anchor="middle" font-size="10" fill="#4a5568">平衡点</text>
  <!-- Accuracy -->
  <rect x="30" y="30" width="140" height="60" rx="10" fill="#f0fff4" stroke="#38a169" stroke-width="1.5"/>
  <text x="100" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="#276749">准确率</text>
  <text x="100" y="72" text-anchor="middle" font-size="9" fill="#2f855a">输出正确且有用的比例</text>
  <line x1="170" y1="60" x2="255" y2="120" stroke="#a0aec0" stroke-width="1" stroke-dasharray="4"/>
  <!-- Hallucination -->
  <rect x="430" y="30" width="140" height="60" rx="10" fill="#fff5f5" stroke="#e53e3e" stroke-width="1.5"/>
  <text x="500" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="#c53030">幻觉率</text>
  <text x="500" y="72" text-anchor="middle" font-size="9" fill="#c53030">错了但看起来是对的</text>
  <line x1="430" y1="60" x2="345" y2="120" stroke="#a0aec0" stroke-width="1" stroke-dasharray="4"/>
  <!-- Latency -->
  <rect x="30" y="190" width="140" height="60" rx="10" fill="#fffff0" stroke="#d69e2e" stroke-width="1.5"/>
  <text x="100" y="215" text-anchor="middle" font-size="12" font-weight="600" fill="#975a16">首Token延迟</text>
  <text x="100" y="232" text-anchor="middle" font-size="9" fill="#975a16">流式输出缓解感知</text>
  <line x1="170" y1="220" x2="255" y2="165" stroke="#a0aec0" stroke-width="1" stroke-dasharray="4"/>
  <!-- Satisfaction -->
  <rect x="430" y="190" width="140" height="60" rx="10" fill="#ebf8ff" stroke="#3182ce" stroke-width="1.5"/>
  <text x="500" y="215" text-anchor="middle" font-size="12" font-weight="600" fill="#2b6cb0">用户满意度</text>
  <text x="500" y="232" text-anchor="middle" font-size="9" fill="#2b6cb0">隐式行为信号 > 赞/踩</text>
  <line x1="430" y1="220" x2="345" y2="165" stroke="#a0aec0" stroke-width="1" stroke-dasharray="4"/>
  <!-- Tension arrows -->
  <text x="300" y="22" text-anchor="middle" font-size="9" fill="#e53e3e">⬌ 互斥：保守提高准确率 → 降低满意度</text>
</svg>
</div>

**这些指标在某些设计选择下会产生冲突。** 比如提高准确率如果靠限制模型的输出范围（让它对不确定的问题拒绝回答），准确率上去了，但用户满意度会下降——用户觉得"这个 AI 什么都不敢回答"。Google Gemini 早期就因为内容安全策略过于保守而被用户吐槽[7]。PM 需要在这些指标之间找平衡点，这本身就是一个需要持续调优的产品决策。

## Token 经济学：增长逻辑被改写了

在我看来，AI PM 工作流中最容易被低估、但对产品策略影响最大的变化是成本结构。

传统互联网产品的增长公式很简单：**获客成本（CAC） < 用户终身价值（LTV）**，只要 LTV/CAC > 1，就值得继续花钱拉新。边际成本趋近于零意味着每多一个用户，LTV 几乎全是利润。

AI 产品的增长公式多了一项：**CAC + 服务成本（Token 消耗） < LTV**。这个"服务成本"不是可以忽略的。

<div class="mermaid">
graph LR
    A["CAC"] --> B["+ Token 成本"] --> C["必须小于 LTV"]
    style B fill:#fff5f5,stroke:#e53e3e
    style C fill:#f0fff4,stroke:#38a169
</div>


算一笔粗账。假设一个 AI 产品使用 GPT-4o 级别的模型，平均每次对话消耗 2000 Token（输入 + 输出），按 OpenAI 的定价大约 0.01-0.03 美元一次[8]。一个活跃用户每天对话 10 次，一个月的算力成本就是 3-9 美元。如果产品定价 199 元/月（约 27 美元），算力成本就占了收入的 11%-33%。

**这还只是活跃付费用户。免费用户每用一次都是净亏损。**

这个成本结构对 PM 的产品决策有几个直接影响：

**免费层的设计变成了一道数学题。** 不是"想让用户用多少就用多少"，而是"每个免费用户每月的平均调用成本是多少，乘以免费用户总量，公司能承受多大的亏损来换取转化漏斗的入口"。这要求 PM 能建立清晰的单位经济模型。

**模型选择变成了产品决策。** 免费用户用小模型（成本低但体验差）还是大模型（体验好但成本高）？不同功能用不同模型（简单任务用轻量模型、复杂任务用旗舰模型）？这些选择直接影响用户体验和成本结构。Kimi 提供了"深度思考"和"快速响应"两种模式供用户选择[9]，本质上就是在让用户在效果和成本之间做取舍。

**增长策略不能再无脑激进。** 传统互联网产品可以通过补贴和裂变快速做到千万级 DAU，反正多一个用户不花什么钱。AI 产品如果这么做，DAU 越高亏损越大。增长必须和成本模型一起算——先验证单位经济模型跑得通，再放大规模。

## 变的是维度，不是底层逻辑

写到这里，似乎 AI PM 和传统 PM 差别很大。但退后一步看，底层逻辑没有变：**在约束条件下最大化用户价值。**

传统 PM 的主要约束是开发资源和排期。AI PM 的约束多了两个维度：输出质量的不确定性，和每次调用的算力成本。约束变多了，产品决策的复杂度确实更高了，但做决策的方法论——定义问题、拆解变量、用数据验证假设、在取舍中找平衡——是一样的。

需要补的 AI 领域知识——Token 计价、模型性能差异、Prompt 工程基础、评估指标——这些概念本身不复杂，短期内可以建立基本认知。但**"知道"和"能用来做决策"是两回事。** 知道幻觉率的定义不难，难的是当你的产品幻觉率在 8% 时，判断该投入资源优化模型还是在产品层做兜底——这个判断需要对用户场景、成本约束和技术边界的综合理解，不是读几篇文章能解决的。

**真正的门槛是：在不确定性中做产品决策的经验。** 这项能力在传统产品中就已经在积累了——每一次 A/B 测试、每一次增长实验、每一次在数据不够完美时做出的取舍，都是在训练这种能力。AI 产品只是把不确定性的浓度调高了。

---

## 参考资料

[1] Midjourney Documentation. Image Generation. https://docs.midjourney.com

[2] Notion. Notion AI Overview. https://www.notion.so/product/ai

[3] Perplexity AI. How Perplexity Works — Source Citations. https://www.perplexity.ai

[4] Google DeepMind Blog. Gemini: A Family of Highly Capable Multimodal Models, 2024. https://deepmind.google/technologies/gemini/

[5] Vectara. Hallucination Evaluation Model — Hughes Hallucination Leaderboard, 2024. https://github.com/vectara/hallucination-leaderboard

[6] OpenAI API Documentation. Streaming. https://platform.openai.com/docs/api-reference/streaming

[7] The Verge. "Google's Gemini AI is too cautious, and it's a problem." 2024. https://www.theverge.com

[8] OpenAI. API Pricing. https://openai.com/pricing

[9] 月之暗面. Kimi 智能助手产品介绍. https://kimi.moonshot.cn
