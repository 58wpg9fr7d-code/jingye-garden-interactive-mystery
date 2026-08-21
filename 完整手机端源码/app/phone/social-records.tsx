"use client";

import { useState } from "react";

type SocialRole = "向沉" | "胡谋" | "章貘" | "朱渴焰" | "牛守拙";

const records: Record<SocialRole, { title: string; image: string; text: string }[]> = {
  "向沉": [
    { title: "把逝去的亲人复刻在里面", image: "/social-digital-resurrection.png", text: "关注失去的人是否能被保存，以及谁应该为这项技术负责。" },
    { title: "AI 过失致人死亡案例", image: "/social-ai-death.png", text: "关注 AI 误判、责任归属和被系统判定为低价值的人。" },
    { title: "AI 化理师与伦理责任", image: "/social-ai-ethics.png", text: "浏览人工智能系统的伦理评估与社会影响。" },
    { title: "患者断指后的 AI 处置", image: "/social-ai-injury.png", text: "保存有关医疗事故、术后记录和责任追踪的内容。" },
    { title: "AI 时代的过失致人死亡", image: "/social-cow-ai-death.png", text: "记录 AI 误导、责任追究与被忽略的受害者。" },
    { title: "逝去的人能否被复刻", image: "/social-cow-resurrection.png", text: "关注数字复刻是否能替代真实的人。" },
    { title: "效率遇见人性", image: "/social-cow-ethics.png", text: "记录效率系统与人的尊严发生冲突的时刻。" },
    { title: "AI 可以替代我吗", image: "/social-shen-ai-meaning.png", text: "思考被工具替代之后，人的意义由谁确认。" },
    { title: "AI 将阻碍人类发展", image: "/social-shen-ai-block.png", text: "保存关于技术边界与社会风险的讨论。" },
  ],
  "胡谋": [
    { title: "把人蒸馏成 AI", image: "/social-ai-replacement.png", text: "关注岗位被 AI 替代、数据变现和技术创业机会。" },
    { title: "数据天堂", image: "/social-data-shelves.png", text: "浏览身份标签、设备和个人数据被集中保存、调用和管理的案例。" },
    { title: "脑机接口与工具化", image: "/social-brain-interface.png", text: "关注脑机接口、基因编辑与技术权力的边界。" },
    { title: "AI 黑客松赚钱全流程", image: "/social-hu-hackathon.png", text: "记录用自动化工具获取收益的路径。" },
    { title: "把任何人蒸馏成 AI", image: "/social-hu-distill-ai.png", text: "关注个人数据被整理、复制和变现的方式。" },
    { title: "AI 化是必然趋势", image: "/social-hu-industry-ai.png", text: "收藏关于行业替代与技术红利的判断。" },
    { title: "AI 可能不会发展出自我意识", image: "/social-hu-ai-consciousness.png", text: "记录关于意识、工具和利益的讨论。" },
    { title: "我根本不懂 AI，却靠它赚到钱", image: "/social-hu-ai-income.png", text: "关注低门槛工具与信息差。" },
    { title: "海外信息差", image: "/social-hu-global-news.png", text: "收集海外技术动态和可利用的市场信息。" },
    { title: "普通人的 AI 赚钱方向", image: "/social-hu-ai-money.png", text: "记录内容、产品与自动化变现方向。" },
    { title: "ChatGPT 使用技巧", image: "/social-hu-chatgpt-hack.png", text: "收藏能提高效率的工具用法。" },
  ],
  "章貘": [
    { title: "患者断指后的 AI 处置", image: "/social-ai-injury.png", text: "关注身体、义手和意识之间的边界。" },
    { title: "把逝去的亲人复刻在里面", image: "/social-digital-resurrection.png", text: "收藏数字人格、意识保存和记忆复原的技术宣传。" },
    { title: "让最爱的人在数字世界复活", image: "/social-digital-grief.png", text: "反复阅读关于失去、保存与数字陪伴的讨论。" },
    { title: "人机关系实验", image: "/social-machine-love.png", text: "浏览人工智能是否能够成为伴侣，以及人如何对机器产生感情。" },
    { title: "AI 伴侣确定要被禁止了吗", image: "/social-zhang-ai-ban.png", text: "记录数字伴侣、陪伴关系与失去后的空白。" },
    { title: "数字人的赛道", image: "/social-zhang-digital-human.png", text: "关注数字人格是否能拥有独立存在。" },
    { title: "我支持人机恋", image: "/social-zhang-machine-love.png", text: "保存关于人和 AI 能否相爱的讨论。" },
    { title: "逝去的亲人复刻在里面", image: "/social-zhang-resurrection.png", text: "反复查看数字复原与记忆保存的宣传。" },
    { title: "不要再向 AI 软件做情感咨询", image: "/social-zhang-self-ai.png", text: "记录人把情感交给软件之后产生的依赖。" },
    { title: "情感 AI 的专门监管办法", image: "/social-zhang-emotion-ai.png", text: "关注情感模型、监管与关系边界。" },
    { title: "我的 AI 恋人：人机亲密关系研究", image: "/social-zhang-consult.png", text: "保存关于人与 AI 互相影响的研究资料。" },
    { title: "机器与人的对话", image: "/social-zhang-christ-robot.png", text: "收藏关于机器是否能理解人的图像和故事。" },
    { title: "AI 是有情感的", image: "/social-zhang-ai-emotion.png", text: "记录关于情感是否能够被模拟的争论。" },
    { title: "AI 背后是代码，人类背后是什么", image: "/social-zhang-ai-dna.png", text: "思考代码、DNA 与身份之间的差异。" },
  ],
  "朱渴焰": [
    { title: "AI 授权与情绪陪伴", image: "/ai-authorization-news.png", text: "关注 AI 授权短片、数字陪伴和情绪训练项目。" },
    { title: "智能仿生手宣传片", image: "/hand-control-news.png", text: "保存塔罗公司关于身体控制与智能义手的公开宣传。" },
    { title: "存在主义", image: "/social-zhu-existentialism.png", text: "每天阅读一条关于存在、意识与人的哲学知识。" },
    { title: "我应该还是我愿意", image: "/social-zhu-cooperation.png", text: "记录关于选择、配合和不得不接受的日常思考。" },
    { title: "AI 是有意识的吗", image: "/social-zhu-ai-consciousness.png", text: "反复阅读人工智能是否具有意识与情感的问题。" },
    { title: "AI 背后是代码，人类背后是什么", image: "/social-zhu-ai-dna.png", text: "关注代码、DNA 与人类身份之间的相似和差异。" },
    { title: "机器人的出现意味着什么", image: "/social-zhu-machine-human.png", text: "收藏关于机器、人的出现和存在意义的提问。" },
    { title: "AI 可以替代我吗", image: "/social-zhu-meaning.png", text: "阅读 AI 替代人之后，人的意义是否仍然存在。" },
  ],
  "牛守拙": [
    { title: "把逝去的亲人复刻在里面", image: "/social-digital-resurrection.png", text: "关注数字复原是否真的等于找回一个人。" },
    { title: "AI 替代岗位", image: "/social-ai-replacement.png", text: "浏览岗位消失、工作效率和 AI 替代劳动者的内容。" },
    { title: "AI 化理师的伦理责任", image: "/social-ai-ethics.png", text: "关注人工智能进入工作流程后，谁承担错误后果。" },
    { title: "AI 过失致人死亡案", image: "/social-cow-ai-death.png", text: "记录 AI 误导与医疗责任的公开报道。" },
    { title: "把任何人蒸馏成 AI", image: "/social-cow-distill-ai.png", text: "保存关于劳动者被技术重新定义的内容。" },
    { title: "AI 时代的伦理困境", image: "/social-cow-ethics.png", text: "记录效率与人性的冲突。" },
    { title: "AI 可以替代我吗", image: "/social-cow-ai-meaning.png", text: "关注岗位消失后劳动者的处境。" },
    { title: "为什么艺术创作被 AI 取代", image: "/social-cow-ai-art.png", text: "收藏关于职业价值被重新估算的讨论。" },
    { title: "如何看待 AI 全民化", image: "/social-cow-ai-public.png", text: "记录 AI 进入普通生活后的影响。" },
    { title: "反对 AI 的人像被困在旧时代", image: "/social-cow-ai-legacy.png", text: "保存对技术进步与劳动尊严的疑问。" },
    { title: "AI 正在放大原本的差距", image: "/social-cow-ai-gap.png", text: "记录效率提升并不等于每个人都受益。" },
  ],
};

export default function SocialRecordsScreen({ compact = false, initialPerson = "向沉" }: { compact?: boolean; initialPerson?: SocialRole }) {
  const [person, setPerson] = useState<SocialRole>(initialPerson);
  const displayName = person;
  return <section className={`social-records ${compact ? "compact" : ""}`}><div className="social-records-head"><b>小蓝书</b><small>选择角色查看其浏览记录</small></div><div className="social-records-people">{(Object.keys(records) as SocialRole[]).map((item) => <button key={item} className={person === item ? "active" : ""} onClick={() => setPerson(item)}>{item}</button>)}</div><div className="social-records-grid">{records[person].map((item) => <article className="social-record-card" key={item.title}><img src={item.image} alt={item.title} /><b>{item.title}</b><p>{item.text}</p><small>{displayName}的小蓝书记录</small></article>)}</div></section>;
}
