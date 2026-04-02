---
title: "AI 产品的订阅制设计：从美图会员体系的几个关键决策说起"
description: "折扣拉新还是免费试用？用户分几层？召回怎么做？这些在传统会员体系中反复验证的问题，AI 产品正在重新踩一遍。"
pubDate: "Mar 12 2026"
badge: "增长"
tags: ["订阅", "Freemium", "商业化", "用户分层"]
---

## 2026 年 AI 订阅制的现状：大家都在摸着石头过河

Kimi 的付费档位从 39 元到 199 元/月不等[1]，扣子空间提供多级订阅[2]，即梦年费首年促销价 949 元（原价 1899 元）[3]，可灵 AI 推出创作者计划[4]。2026 年几乎每一个头部 AI 产品都在做 Freemium，但如果你仔细看各家的订阅设计，会发现一个问题：**大部分产品的 Freemium 还停留在非常粗糙的阶段。**

粗糙体现在哪？免费用户统一限制 N 次调用，付费用户统一解锁无限次，偶尔搞个"限时 7 折"。用户分层？没有。差异化的转化引导？没有。系统化的召回机制？更没有。

这不奇怪。AI 产品团队的核心能力集中在技术和产品体验上，精细化的订阅运营不是他们的强项。而这恰好是传统互联网会员体系已经反复验证过的领域。

我在美图秀秀用了两年时间从 0 到 1 搭了一套完整的会员体系。回头看，里面有几个关键决策节点，和现在 AI 产品面临的问题高度重合。

## 第一个决策：折扣拉新 vs 免费试用

会员体系上线初期，第一个要回答的问题是：**怎么让从未付过费的用户迈出第一步？**

我们最初的策略是"首期折扣"——新用户首月半价。逻辑很直觉：降低价格门槛，让更多人愿意尝试。效果也有，大盘收入新增了 2.7%+。

但我们很快发现了问题：**折扣吸引来的用户，续费率明显偏低。**

原因不难理解。折扣的吸引力是"便宜"，而不是"这个产品好用"。用户因为便宜订了，用了一个月觉得"也还行吧但不是非用不可"，续费时恢复原价就跑了。**折扣解决的是"愿不愿意掏钱"的问题，但没有解决"觉不觉得值"的问题。**

于是我们迭代成了"首期免费试用"。逻辑完全不同：不是让你便宜买，而是让你先免费用完整的会员功能，用产品价值本身来说服你。如果用了之后觉得确实有用，到期自动扣费；如果觉得没用，随时取消。

结果差异非常大：免费试用的续费率达到 33%+，远高于折扣策略。更关键的是，免费试用最终贡献了大盘收入的 70%。

<div class="mermaid">
graph LR
    A["折扣策略"] -->|"半价吸引"| B["续费率低"]
    C["免费试用"] -->|"体验价值"| D["续费率 33%+"]
    style B fill:#fff5f5,stroke:#e53e3e
    style D fill:#f0fff4,stroke:#38a169
</div>

这个决策对 AI 产品的启示很直接。现在大部分 AI 产品的付费转化策略是"限制免费额度"——你免费用了 10 次，想继续用就得付费。这本质上是一种"倒逼"策略，用户付费的动机是"我的免费次数用完了"而不是"我真的觉得这个付费版更好"。

一个可能更有效的策略是：**给新用户一段完整的付费体验期（比如 3-7 天全功能免费试用），让他们在没有限制的情况下充分体验付费版的价值。** 这个策略的前提是你对产品的付费价值有信心——如果用户免费体验了全部功能之后还是不愿意付费，那问题出在产品本身，而不是转化策略。

当然，AI 产品做免费试用有一个传统产品没有的成本考量：试用期的 Token 消耗是真金白银。这就需要做一笔账：试用期每用户平均消耗的算力成本是多少，乘以试用用户量，再乘以预期的续费率——如果 LTV 能覆盖这个成本，策略就可行。如果覆盖不了，那可以在试用期对模型做一些降级处理（比如用性能稍弱但成本更低的模型），在成本和体验之间找平衡。

## 第二个决策：用户分层的颗粒度

会员体系上线一段时间后，我们面临了第二个关键决策：**对所有用户用同一套运营策略，还是分层做差异化？**

答案当然是分层。但分几层、按什么维度分，这里面有很多取舍。

我们最终的分层方案是基于三个维度：**活跃度（用多频繁）、订阅状态（免费/付费/过期）、付费意愿信号（有没有看过定价页、点过订阅按钮等行为）**。三个维度组合下来，把用户分成了 14 层。

<div class="design-figure">
<div class="design-figure__title">用户分层策略矩阵（示意）</div>
<svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, sans-serif;">
  <!-- Header -->
  <rect x="0" y="0" width="140" height="40" rx="4" fill="#4db6ac"/>
  <text x="70" y="25" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">活跃度 \ 状态</text>
  <rect x="140" y="0" width="160" height="40" rx="4" fill="#4db6ac"/>
  <text x="220" y="25" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">未付费 + 有意愿</text>
  <rect x="300" y="0" width="160" height="40" rx="4" fill="#4db6ac"/>
  <text x="380" y="25" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">未付费 + 无意愿</text>
  <rect x="460" y="0" width="160" height="40" rx="4" fill="#4db6ac"/>
  <text x="540" y="25" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">已付费</text>
  <!-- Row 1: High active -->
  <rect x="0" y="44" width="140" height="75" rx="4" fill="#e0f2f1" stroke="#b2dfdb"/>
  <text x="70" y="75" text-anchor="middle" font-size="12" font-weight="600" fill="#00695c">高活跃</text>
  <text x="70" y="92" text-anchor="middle" font-size="9" fill="#00897b">每日使用</text>
  <rect x="140" y="44" width="160" height="75" rx="4" fill="#c8e6c9" stroke="#a5d6a7"/>
  <text x="220" y="70" text-anchor="middle" font-size="10" font-weight="600" fill="#2e7d32">🔥 最高价值</text>
  <text x="220" y="87" text-anchor="middle" font-size="9" fill="#388e3c">关键节点推付费</text>
  <text x="220" y="102" text-anchor="middle" font-size="9" fill="#388e3c">价值感知瞬间触达</text>
  <rect x="300" y="44" width="160" height="75" rx="4" fill="#fff9c4" stroke="#fff176"/>
  <text x="380" y="70" text-anchor="middle" font-size="10" font-weight="600" fill="#f57f17">场景教育</text>
  <text x="380" y="87" text-anchor="middle" font-size="9" fill="#f9a825">推高级功能案例</text>
  <text x="380" y="102" text-anchor="middle" font-size="9" fill="#f9a825">提升使用深度</text>
  <rect x="460" y="44" width="160" height="75" rx="4" fill="#e8f5e9" stroke="#c8e6c9"/>
  <text x="540" y="70" text-anchor="middle" font-size="10" font-weight="600" fill="#2e7d32">升级引导</text>
  <text x="540" y="87" text-anchor="middle" font-size="9" fill="#388e3c">推高阶套餐</text>
  <text x="540" y="102" text-anchor="middle" font-size="9" fill="#388e3c">提升 ARPU</text>
  <!-- Row 2: Mid active -->
  <rect x="0" y="123" width="140" height="75" rx="4" fill="#e0f2f1" stroke="#b2dfdb"/>
  <text x="70" y="154" text-anchor="middle" font-size="12" font-weight="600" fill="#00695c">中活跃</text>
  <text x="70" y="171" text-anchor="middle" font-size="9" fill="#00897b">每周 2-3 次</text>
  <rect x="140" y="123" width="160" height="75" rx="4" fill="#fff9c4" stroke="#fff176"/>
  <text x="220" y="149" text-anchor="middle" font-size="10" font-weight="600" fill="#f57f17">培育转化</text>
  <text x="220" y="166" text-anchor="middle" font-size="9" fill="#f9a825">额度即将耗尽时</text>
  <text x="220" y="181" text-anchor="middle" font-size="9" fill="#f9a825">精准展示付费价值</text>
  <rect x="300" y="123" width="160" height="75" rx="4" fill="#fff3e0" stroke="#ffe0b2"/>
  <text x="380" y="149" text-anchor="middle" font-size="10" font-weight="600" fill="#e65100">激活优先</text>
  <text x="380" y="166" text-anchor="middle" font-size="9" fill="#f57c00">先提频次再谈付费</text>
  <text x="380" y="181" text-anchor="middle" font-size="9" fill="#f57c00">推使用场景提醒</text>
  <rect x="460" y="123" width="160" height="75" rx="4" fill="#fff9c4" stroke="#fff176"/>
  <text x="540" y="149" text-anchor="middle" font-size="10" font-weight="600" fill="#f57f17">⚠️ 续费风险</text>
  <text x="540" y="166" text-anchor="middle" font-size="9" fill="#f9a825">提前介入激活</text>
  <text x="540" y="181" text-anchor="middle" font-size="9" fill="#f9a825">推新功能、个性化内容</text>
  <!-- Row 3: Low active -->
  <rect x="0" y="202" width="140" height="75" rx="4" fill="#e0f2f1" stroke="#b2dfdb"/>
  <text x="70" y="233" text-anchor="middle" font-size="12" font-weight="600" fill="#00695c">低活跃</text>
  <text x="70" y="250" text-anchor="middle" font-size="9" fill="#00897b">每周 &lt;1 次</text>
  <rect x="140" y="202" width="160" height="75" rx="4" fill="#fff3e0" stroke="#ffe0b2"/>
  <text x="220" y="228" text-anchor="middle" font-size="10" font-weight="600" fill="#e65100">重新激活</text>
  <text x="220" y="245" text-anchor="middle" font-size="9" fill="#f57c00">邮件/推送提醒</text>
  <text x="220" y="260" text-anchor="middle" font-size="9" fill="#f57c00">限时免费体验</text>
  <rect x="300" y="202" width="160" height="75" rx="4" fill="#ffebee" stroke="#ffcdd2"/>
  <text x="380" y="228" text-anchor="middle" font-size="10" font-weight="600" fill="#c62828">沉默用户</text>
  <text x="380" y="245" text-anchor="middle" font-size="9" fill="#d32f2f">低成本唤醒</text>
  <text x="380" y="260" text-anchor="middle" font-size="9" fill="#d32f2f">或放入召回池</text>
  <rect x="460" y="202" width="160" height="75" rx="4" fill="#ffebee" stroke="#ffcdd2"/>
  <text x="540" y="228" text-anchor="middle" font-size="10" font-weight="600" fill="#c62828">🚨 高流失风险</text>
  <text x="540" y="245" text-anchor="middle" font-size="9" fill="#d32f2f">挽留弹窗 + 过期限免</text>
  <text x="540" y="260" text-anchor="middle" font-size="9" fill="#d32f2f">召回率 2%→10%+</text>
</svg>
</div>

分层之后，每层对应不同的策略。举几个例子：

**高活跃 + 未付费 + 有付费意愿信号：** 这是转化概率最高的群体。策略是在用户使用产品的关键节点（比如刚完成一次满意的编辑操作后）推送付费引导，强调"解锁更多高级功能"。推送的时机非常关键——不是随机弹窗，而是在用户刚刚感受到产品价值的那个瞬间。

**中活跃 + 未付费 + 无付费意愿信号：** 这群人用产品但不够深入，也没表现出付费兴趣。策略不是硬推付费，而是先做"场景教育"——推送他们可能没发现的高级功能使用案例，提升使用深度。使用深度上来了，付费意愿自然会跟着上来。

**已付费 + 活跃度下降：** 续费风险用户。策略是提前介入（不等到到期那一天），通过推送新功能、个性化内容来重新激活使用。

14 层分层的效果：**会员转化率提升 20%+，付费收入提升 40%+。**

这套方法论迁移到 AI 产品上是完全可行的。事实上 AI 产品的行为数据更丰富——你不仅知道用户用了多少次，还知道他用了什么功能、对话了什么主题、输出质量满不满意（通过重新生成频率等隐式信号来判断）。**数据颗粒度比传统工具产品更细，理论上可以做出更精准的分层。**

但据我观察，2026 年大部分 AI 产品的用户运营还停留在"一刀切"阶段。这意味着谁先把精细化分层做起来，谁就能在转化效率上拉开差距。

## 第三个决策：召回是转化效率最高的增长

在美图的会员运营中，有一个数据让我印象深刻：**召回用户的转化率是新用户的 10 倍。**

我们的召回体系核心是"挽留弹窗 + 过期限免"的组合策略。用户会员到期、或取消续费时，触发挽留弹窗（通常是一个"再给你 3 天免费"的挽留包）。如果用户流失了，在过期后 7 天和 30 天分别做一次召回触达，提供限时免费重新体验的机会。

效果：会员召回率从 2% 提升到 10%+，召回用户中有 20%+ 重新付费（大盘的新用户付费转化率只有约 2%）。

为什么召回效果这么好？因为这些用户已经用过你的产品、已经为产品付过费——他们离开不是因为不认可产品价值，通常是因为某个阶段用得少了、觉得"先停一停"。一个有针对性的触达就能把他们拉回来。

AI 产品的用户流失问题比传统工具更严重。很多用户抱着尝鲜心态注册，用了几天觉得"挺有意思但不知道具体能干嘛"就走了。但这些流失用户不是永远流失了——随着 AI 产品能力的持续迭代，他们可能在某个新功能上线时产生回流动机。

**关键是你要有一套系统化的召回机制来捕捉这些节点。** 而不是等着用户自己想起来回来。

需要注意的是，AI 产品做召回赠送免费体验天数，每天都有真实的 Token 成本。所以召回策略的 ROI 计算比传统产品多一步：不只算"召回率 × 转化率 × LTV"，还要减去召回期间的算力消耗。即便如此，由于召回用户的转化率远高于新用户，单位转化成本通常仍然是最优的。

## 订阅中台：避免每个产品重新造轮子

在美图还有一件值得单独说的事：**订阅中台的搭建。**

当美图只有美图秀秀一个产品需要会员体系时，把订阅逻辑写在业务代码里是合理的。但当 Wink、Chic、蛋啵等新 APP 陆续需要接入会员能力时，每个产品重新开发一套订阅系统就不合理了。

我主导搭建的订阅中台，把会员体系拆成了五个可复用的模块：**会员管理（用户的订阅状态和权益）、订单管理（支付和退款流程）、价格管理（定价策略和促销规则）、权益管理（不同档位对应什么功能）、运营工具（分层触达、召回策略、A/B 测试）**。

新产品接入时间从一个月缩短到两周。

<div class="mermaid">
graph LR
    A["多产品接入"] --> B["会员"] --- C["订单"] --- D["价格"] --- E["权益"] --- F["运营"]
    style A fill:#e0f2f1,stroke:#4db6ac
</div>


这种"模块化、可配置、跨产品复用"的架构思维，和 AI 产品平台的设计逻辑是相通的。扣子（Coze）本质上就是一个 AI Agent 的中台——让开发者快速搭建和部署不同的 AI 应用，而不用每次从零开始[5]。火山方舟也是类似的逻辑——提供标准化的模型接入和推理服务，让不同业务快速调用 AI 能力[6]。

理解中台架构的人，在设计 AI 平台型产品时会有天然的优势。因为核心挑战是一样的：**怎么把复杂的能力拆解成标准化的模块，让不同的上层应用能快速组合使用。**

## AI Freemium 的特殊变量：算力成本

最后要说一个 AI 产品 Freemium 和传统产品最大的区别：**边际成本不为零。**

在美图，多一个用户使用滤镜功能，服务器成本几乎可以忽略。但 AI 产品每次调用都在消耗 Token。按 OpenAI 的 GPT-4o 定价[7]，一个活跃用户每月的算力成本在 3-9 美元之间（取决于使用频率和对话长度）。

这意味着 AI 产品的 Freemium 设计多了一个约束变量。传统产品做 Freemium 只需要算"免费用户有多少能转化为付费用户"。AI 产品还要算"免费用户在转化之前一共会消耗多少算力成本，这个成本能不能被付费转化的 LTV 覆盖"。

常见的成本控制策略包括：免费版使用小模型（GPT-3.5 级别的推理成本大约是 GPT-4 的 1/10-1/20[7]）、限制每日调用次数、限制单次对话轮数、限制输出长度。每一种选择都是在"用户体验"和"成本控制"之间做取舍。

做过传统会员体系的人在这里反而有优势——**"成本—体验—转化"的三角平衡**不是 AI 产品独有的挑战，思考框架是通用的。但变量的变化会导致结论不同。

举个具体的例子：在美图，免费试用的成本几乎可以忽略，所以"尽可能多地让用户免费体验"是正确策略。但在 AI 产品中，同样的策略如果不加模型降级或调用限制，免费试用的成本可能高到吃掉大部分转化收益。框架一样（算试用成本和续费收入的 ROI），但算出来的最优解不一样——这正是需要有人把框架和新变量结合起来重新算一遍的原因。

---

## 参考资料

[1] 月之暗面. Kimi 会员定价方案. https://kimi.moonshot.cn

[2] 字节跳动. 扣子空间订阅体系. https://www.coze.cn

[3] 即梦AI. 即梦会员方案. https://jimeng.jianying.com

[4] 快手可灵AI. 创作者计划. https://klingai.kuaishou.com

[5] 字节跳动. 扣子（Coze）AI 开发平台. https://www.coze.cn

[6] 火山引擎. 火山方舟大模型服务平台. https://www.volcengine.com/product/ark

[7] OpenAI. API Pricing. https://openai.com/pricing
