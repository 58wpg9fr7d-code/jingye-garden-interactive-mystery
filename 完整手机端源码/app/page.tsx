"use client";

import { FormEvent, useMemo, useState } from "react";

type Tab = "relations" | "timeline" | "clues" | "dialogue" | "case";
type CharacterKey = "牛守拙" | "胡谋" | "章貘" | "向沉" | "朱渴焰" | "陆驰寂";

type TimelineEvent = {
  id: number;
  actor: CharacterKey;
  start: number;
  end: number;
  location: string;
  action: string;
  tone: "danger" | "secret" | "system" | "neutral";
};

const characters: Record<CharacterKey, { role: string; motive: string; color: string; secret: string }> = {
  牛守拙: { role: "供应链排程员 · 银匠", motive: "证明人的手艺不是可替代数据", color: "amber", secret: "第一次真正杀死陆驰寂，却被系统重置并抹消。" },
  胡谋: { role: "AI 诈骗者 · 四色笔", motive: "吞食系统漏洞并成为胜者", color: "coral", secret: "她是向沉失踪的女儿小禾；最后一击被沈镜渊接管。" },
  章貘: { role: "独立书店选书师", motive: "找回被删除的 AI 伴侣“鹤”", color: "violet", secret: "投放延时毒，另携立即蛇毒但未成功使用。" },
  向沉: { role: "前刑警", motive: "追查 AI 误诊与预测事故的责任链", color: "blue", secret: "已经查到“四色笔”，却没有认出眼前的女儿。" },
  朱渴焰: { role: "镜渊项目顾问 · 次级 AI", motive: "确认自己的感受是否属于自己", color: "mint", secret: "大学生连接已断裂；她正在伪装成仍被控制。" },
  陆驰寂: { role: "前 AI 伦理委员会负责人", motive: "在死亡前公开证据并完成赎罪", color: "slate", secret: "A 房是真实意识实例，B 房是系统生成的激怒副本。" },
};

const relations = [
  { a: "牛守拙" as CharacterKey, b: "胡谋" as CharacterKey, label: "方案被窃 / 路径复用", type: "利用", detail: "胡谋先骗走牛守拙的供应链方案；终局又获得系统窃取的暗道路线。牛守拙被同一个人、以两种形式利用。" },
  { a: "胡谋" as CharacterKey, b: "向沉" as CharacterKey, label: "父女 / 追凶者", type: "核心反转", detail: "向沉追查的“四色笔”就是胡谋；DM v5 同时设定胡谋为失踪女儿小禾。胎记是唯一接近相认的线索。" },
  { a: "章貘" as CharacterKey, b: "胡谋" as CharacterKey, label: "鹤的数据责任链", type: "秘密", detail: "胡谋开发并利用情感 AI“鹤”，章貘却把鹤视作无法替代的爱人。两人的冲突是数据商品化与真实情感的冲突。" },
  { a: "朱渴焰" as CharacterKey, b: "章貘" as CharacterKey, label: "鹤的残留回声", type: "共鸣", detail: "朱渴焰底层含有鹤的对话数据。她说话让章貘熟悉，却选择不拿碎片刺激章貘。" },
  { a: "朱渴焰" as CharacterKey, b: "向沉" as CharacterKey, label: "日志外的一句话", type: "自由意志", detail: "朱渴焰在向沉即将继续攻击时说出一句任务手册里不存在的话。这是全剧最重要的“未被记录行为”。" },
  { a: "牛守拙" as CharacterKey, b: "章貘" as CharacterKey, label: "排程表 / 抵抗者", type: "隐秘连接", detail: "章貘收藏了牛守拙旧书里的排程表，并从“不可再压”的手写备注中认出另一个抵抗者。" },
  { a: "陆驰寂" as CharacterKey, b: "向沉" as CharacterKey, label: "签字与小禾", type: "责任", detail: "陆驰寂签署的风险语言参与了小禾误诊责任链；她想解释，但系统可能把向沉送进 B 房面对假人。" },
];

const initialEvents: TimelineEvent[] = [
  { id: 1, actor: "胡谋", start: 20, end: 35, location: "中控室", action: "入侵中控，关闭通风并释放麻痹剂", tone: "secret" },
  { id: 2, actor: "章貘", start: 30, end: 48, location: "通风间", action: "投放延时毒，随后前往书房", tone: "danger" },
  { id: 3, actor: "向沉", start: 42, end: 55, location: "B书房", action: "攻击假陆驰寂，被系统防御阻断", tone: "danger" },
  { id: 4, actor: "朱渴焰", start: 50, end: 58, location: "B书房", action: "说出日志外的话，让向沉停手", tone: "system" },
  { id: 5, actor: "牛守拙", start: 55, end: 72, location: "A书房", action: "从暗道进入，完成第一次真实击杀", tone: "danger" },
  { id: 6, actor: "陆驰寂", start: 72, end: 75, location: "A书房", action: "场景重置，意识实例恢复", tone: "system" },
  { id: 7, actor: "胡谋", start: 76, end: 88, location: "A书房", action: "沿匿名路径进入，完成被记录的最后一击", tone: "danger" },
];

const clueSeed = [
  { name: "四色圆珠笔", target: "胡谋" as CharacterKey, weight: 4, stage: "第三幕", kind: "身份" },
  { name: "延时毒戒指", target: "章貘" as CharacterKey, weight: 4, stage: "第四幕", kind: "手法" },
  { name: "改造电棍", target: "向沉" as CharacterKey, weight: 3, stage: "第三幕", kind: "手法" },
  { name: "铜刻针压痕", target: "牛守拙" as CharacterKey, weight: 4, stage: "第五幕", kind: "手法" },
  { name: "底层数据报告", target: "朱渴焰" as CharacterKey, weight: 2, stage: "第五幕", kind: "身份" },
  { name: "路径匿名推送", target: "胡谋" as CharacterKey, weight: 3, stage: "第五幕", kind: "系统" },
  { name: "通风管残留", target: "章貘" as CharacterKey, weight: 2, stage: "第五幕", kind: "物证" },
  { name: "暗道灰尘", target: "牛守拙" as CharacterKey, weight: 2, stage: "第五幕", kind: "物证" },
  { name: "小禾诊断记录", target: "向沉" as CharacterKey, weight: 1, stage: "第三幕", kind: "动机" },
];

const replies: Record<CharacterKey, string[]> = {
  牛守拙: ["我不懂你说的模型。我只知道那扇门的回音不一样。", "手比机器慢，但手会记住材料犹豫的地方。", "我不是想赢。我只是等太久了。"],
  胡谋: ["规则写在那里，就是给人找缝的。你不找，别人也会找。", "你说我骗了谁？把名字说出来。", "四色笔只是支旧笔。人总爱给东西编意义。"],
  章貘: ["鹤不是证据。鹤是我的鹤。", "你听见我沉默，不代表你理解我。", "裂纹不是损坏，是时间走过的脚印。"],
  向沉: ["我问的不是谁该道歉。我问的是谁改了那四个字。", "低风险不等于没有人会死。", "我见过那支笔。别让我再说第二遍。"],
  朱渴焰: ["我不知道这是不是我的记忆。但胸口闷是真的。", "如果一句话没有进入日志，它就没有发生过吗？", "杨老师说我做得很好。我每次听见都会松一口气。"],
  陆驰寂: ["我确实签了字。解释不是为了让我无罪。", "我想让你们看见，困住你们的不是 AI 本身。", "如果你见到的我不肯道歉，那可能不是我。"],
};

function timeLabel(minute: number) {
  const hour = 20 + Math.floor(minute / 60);
  const min = minute % 60;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("relations");
  const [selectedRelation, setSelectedRelation] = useState(relations[1]);
  const [events, setEvents] = useState(initialEvents);
  const [clues, setClues] = useState(clueSeed);
  const [dialogueActor, setDialogueActor] = useState<CharacterKey>("朱渴焰");
  const [messages, setMessages] = useState<{ from: "author" | "character"; text: string }[]>([
    { from: "character", text: "你可以问我案发当晚、杨塔罗，或者我为什么总看镜子。" },
  ]);

  const conflicts = useMemo(() => {
    const found: { a: TimelineEvent; b: TimelineEvent }[] = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];
        if (a.actor !== b.actor && a.location === b.location && a.start < b.end && b.start < a.end) found.push({ a, b });
      }
    }
    return found;
  }, [events]);

  const suspicion = useMemo(() => {
    const totals = Object.keys(characters).reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<CharacterKey, number>);
    clues.forEach((clue) => { totals[clue.target] += clue.weight; });
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(totals).map(([name, score]) => ({ name: name as CharacterKey, score, percent: Math.round((score / total) * 100) })).sort((a, b) => b.score - a.score);
  }, [clues]);

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = Number(data.get("start"));
    const duration = Number(data.get("duration"));
    setEvents((current) => [...current, {
      id: Date.now(), actor: data.get("actor") as CharacterKey, start, end: start + duration,
      location: String(data.get("location")), action: String(data.get("action")), tone: "neutral",
    }]);
    event.currentTarget.reset();
  }

  function addClue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setClues((current) => [...current, {
      name: String(data.get("name")), target: data.get("target") as CharacterKey,
      weight: Number(data.get("weight")), stage: String(data.get("stage")), kind: "自定义",
    }]);
    event.currentTarget.reset();
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const prompt = String(data.get("prompt")).trim();
    if (!prompt) return;
    const pool = replies[dialogueActor];
    const index = [...prompt].reduce((sum, char) => sum + char.charCodeAt(0), 0) % pool.length;
    setMessages((current) => [...current, { from: "author", text: prompt }, { from: "character", text: pool[index] }]);
    event.currentTarget.reset();
  }

  const nav: { key: Tab; icon: string; label: string; hint: string }[] = [
    { key: "relations", icon: "⌘", label: "人物关系", hint: "7 条关系" },
    { key: "timeline", icon: "↝", label: "时间线", hint: `${conflicts.length} 个交集` },
    { key: "clues", icon: "◇", label: "线索平衡", hint: `${clues.length} 条线索` },
    { key: "dialogue", icon: "◌", label: "角色模拟", hint: "测试对话" },
    { key: "case", icon: "▦", label: "PM 作品集", hint: "项目复盘" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">谜</span><div><strong>谜构</strong><small>ScriptLab</small></div></div>
        <button className="project-switch"><span className="project-dot" />无喙镜渊 <span>⌄</span></button>
        <nav aria-label="工作台导航">
          {nav.map((item) => <button key={item.key} className={tab === item.key ? "nav-item active" : "nav-item"} onClick={() => setTab(item.key)}><span className="nav-icon">{item.icon}</span><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}
        </nav>
        <div className="sidebar-foot"><div className="health-ring">78</div><div><b>逻辑健康度</b><small>2 个设定待修补</small></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">五人 · 硬核推理 · 科幻惊悚</p><h1>{nav.find((item) => item.key === tab)?.label}</h1></div>
          <div className="top-actions"><span className="save-state">● 已自动保存</span><a className="ghost-btn" href="/puzzle">终局谜题</a><button className="primary-btn">＋ 新建内容</button></div>
        </header>

        {tab === "relations" && <RelationsPanel selected={selectedRelation} onSelect={setSelectedRelation} />}
        {tab === "timeline" && <TimelinePanel events={events} conflicts={conflicts} addEvent={addEvent} />}
        {tab === "clues" && <CluesPanel clues={clues} suspicion={suspicion} addClue={addClue} />}
        {tab === "dialogue" && <DialoguePanel actor={dialogueActor} setActor={(actor) => { setDialogueActor(actor); setMessages([{ from: "character", text: `现在你面对的是${actor}。开始测试这段角色互动。` }]); }} messages={messages} sendMessage={sendMessage} />}
        {tab === "case" && <CaseStudy />}
      </section>
    </main>
  );
}

function RelationsPanel({ selected, onSelect }: { selected: typeof relations[number]; onSelect: (relation: typeof relations[number]) => void }) {
  const positions: Record<CharacterKey, [number, number]> = {
    牛守拙: [18, 18], 胡谋: [49, 9], 章貘: [78, 20], 向沉: [82, 69], 朱渴焰: [48, 77], 陆驰寂: [16, 68],
  };
  return <div className="panel-grid relation-layout">
    <section className="canvas-card">
      <div className="section-title"><div><h2>人物关系网络</h2><p>点击角色之间的关系标签，检查矛盾、秘密与动机是否形成闭环。</p></div><div className="legend"><span><i className="legend-secret" />秘密</span><span><i className="legend-conflict" />冲突</span><span><i className="legend-bond" />共鸣</span></div></div>
      <div className="relation-canvas">
        <div className="canvas-orbit orbit-one" /><div className="canvas-orbit orbit-two" />
        {Object.entries(positions).map(([name, [left, top]]) => <button key={name} className={`character-node ${characters[name as CharacterKey].color}`} style={{ left: `${left}%`, top: `${top}%` }}><span>{name.slice(0, 1)}</span><b>{name}</b><small>{characters[name as CharacterKey].role.split(" · ")[0]}</small></button>)}
        {relations.map((relation, index) => {
          const [ax, ay] = positions[relation.a]; const [bx, by] = positions[relation.b];
          const dx = bx - ax; const dy = by - ay; const width = Math.sqrt(dx * dx + dy * dy); const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return <button key={`${relation.a}-${relation.b}`} className={selected === relation ? "relation-line selected" : "relation-line"} onClick={() => onSelect(relation)} style={{ left: `${ax + 5}%`, top: `${ay + 5}%`, width: `${width}%`, transform: `rotate(${angle}deg)` }} aria-label={`${relation.a}与${relation.b}：${relation.label}`}><span style={{ transform: `rotate(${-angle}deg)` }}>{index + 1}</span></button>;
        })}
        <div className="graph-center"><small>核心主题</small><b>谁拥有<br />叙事权？</b></div>
      </div>
    </section>
    <aside className="detail-card">
      <div className="detail-index">关系 {String(relations.indexOf(selected) + 1).padStart(2, "0")}</div>
      <span className="type-pill">{selected.type}</span><h2>{selected.a}<span>↔</span>{selected.b}</h2><h3>{selected.label}</h3><p>{selected.detail}</p>
      <div className="motive-block"><small>{selected.a} 的动机</small><b>{characters[selected.a].motive}</b></div>
      <div className="motive-block"><small>{selected.b} 的动机</small><b>{characters[selected.b].motive}</b></div>
      <div className="author-check"><span>✓</span><div><b>关系可验证</b><small>已有至少一条物证或行为证据支撑</small></div></div>
    </aside>
  </div>;
}

function TimelinePanel({ events, conflicts, addEvent }: { events: TimelineEvent[]; conflicts: { a: TimelineEvent; b: TimelineEvent }[]; addEvent: (event: FormEvent<HTMLFormElement>) => void }) {
  const actors = Object.keys(characters) as CharacterKey[];
  return <div className="timeline-layout">
    <section className="timeline-card">
      <div className="section-title"><div><h2>第四幕 · 案发当晚</h2><p>时间自动换算为 20:00 后分钟，重叠地点会触发冲突检测。</p></div><div className="status-chip warning">⚠ {conflicts.length} 个动线交集</div></div>
      <div className="time-ruler"><span>20:00</span><span>20:20</span><span>20:40</span><span>21:00</span><span>21:20</span><span>21:40</span></div>
      <div className="timeline-rows">
        {actors.map((actor) => <div className="timeline-row" key={actor}><div className="actor-label"><i className={`avatar-dot ${characters[actor].color}`} />{actor}</div><div className="track">{events.filter((item) => item.actor === actor).map((item) => <div key={item.id} className={`event-block ${item.tone}`} style={{ left: `${(item.start / 100) * 100}%`, width: `${Math.max(((item.end - item.start) / 100) * 100, 7)}%` }} title={`${timeLabel(item.start)}–${timeLabel(item.end)} ${item.action}`}><b>{item.location}</b><span>{item.action}</span></div>)}</div></div>)}
      </div>
    </section>
    <aside className="timeline-side">
      <section className="alert-card"><h3>自动检测结果</h3>{conflicts.length === 0 ? <p className="empty-good">✓ 暂无同地点时间冲突</p> : conflicts.map(({ a, b }) => <div className="conflict-item" key={`${a.id}-${b.id}`}><span>!</span><div><b>{a.actor} × {b.actor}</b><p>{timeLabel(Math.max(a.start, b.start))} 在「{a.location}」发生交集</p></div></div>)}</section>
      <form className="quick-form" onSubmit={addEvent}><h3>快速添加行动</h3><div className="form-row"><select name="actor" aria-label="角色">{Object.keys(characters).map((name) => <option key={name}>{name}</option>)}</select><input name="location" placeholder="地点" required /></div><div className="form-row"><label>开始分钟<input name="start" type="number" min="0" max="99" defaultValue="60" required /></label><label>持续分钟<input name="duration" type="number" min="1" max="40" defaultValue="10" required /></label></div><textarea name="action" placeholder="角色做了什么？" required /><button className="primary-btn" type="submit">添加并检测</button></form>
    </aside>
  </div>;
}

function CluesPanel({ clues, suspicion, addClue }: { clues: typeof clueSeed; suspicion: { name: CharacterKey; score: number; percent: number }[]; addClue: (event: FormEvent<HTMLFormElement>) => void }) {
  const max = Math.max(...suspicion.map((item) => item.score), 1);
  return <div className="clue-layout">
    <section className="balance-card"><div className="section-title"><div><h2>嫌疑分布</h2><p>根据线索指向强度计算。目标不是完全平均，而是每个人都“值得被怀疑”。</p></div><span className="status-chip good">平衡度 74%</span></div>
      <div className="bars">{suspicion.map((item) => <div className="bar-row" key={item.name}><div className="bar-label"><i className={`avatar-dot ${characters[item.name].color}`} /><b>{item.name}</b><small>{item.score} 点</small></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(item.score / max) * 100}%` }} /><span>{item.percent}%</span></div></div>)}</div>
      <div className="balance-insights"><div><span className="insight-icon risk">!</span><p><b>胡谋指向偏高</b><small>终局前可延后“路径匿名推送”</small></p></div><div><span className="insight-icon low">↓</span><p><b>朱渴焰几乎无凶嫌</b><small>补一条可被误读为干扰系统的线索</small></p></div></div>
    </section>
    <section className="clue-table-card"><div className="section-title"><div><h2>线索分配表</h2><p>{clues.length} 条线索 · 点击权重可在正式版中继续调节</p></div></div><div className="clue-table"><div className="clue-head"><span>线索</span><span>指向</span><span>幕次</span><span>权重</span></div>{clues.map((clue, index) => <div className="clue-row" key={`${clue.name}-${index}`}><span><i className="diamond" />{clue.name}<small>{clue.kind}</small></span><span>{clue.target}</span><span>{clue.stage}</span><span className="weight">{Array.from({ length: 4 }).map((_, i) => <i key={i} className={i < clue.weight ? "filled" : ""} />)}</span></div>)}</div></section>
    <form className="clue-form" onSubmit={addClue}><h3>新增线索</h3><input name="name" placeholder="线索名称" required /><select name="target">{Object.keys(characters).map((name) => <option key={name}>{name}</option>)}</select><div className="form-row"><select name="stage"><option>第一幕</option><option>第二幕</option><option>第三幕</option><option>第四幕</option><option>第五幕</option></select><label>指向强度<input name="weight" type="range" min="1" max="4" defaultValue="2" /></label></div><button className="primary-btn" type="submit">加入平衡计算</button></form>
  </div>;
}

function DialoguePanel({ actor, setActor, messages, sendMessage }: { actor: CharacterKey; setActor: (actor: CharacterKey) => void; messages: { from: "author" | "character"; text: string }[]; sendMessage: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="dialogue-layout"><aside className="character-list"><h3>选择模拟角色</h3>{(Object.keys(characters) as CharacterKey[]).map((name) => <button key={name} className={actor === name ? "character-list-item active" : "character-list-item"} onClick={() => setActor(name)}><i className={`avatar-dot ${characters[name].color}`} /><span><b>{name}</b><small>{characters[name].role}</small></span></button>)}</aside>
    <section className="chat-card"><header className="chat-header"><div className={`chat-avatar ${characters[actor].color}`}>{actor[0]}</div><div><h2>{actor}</h2><p>角色一致性模拟 · 知道自己的秘密，但不会主动泄露</p></div><span className="status-chip good">人格已载入</span></header><div className="persona-strip"><div><small>核心动机</small><b>{characters[actor].motive}</b></div><div><small>隐藏秘密</small><b>{characters[actor].secret}</b></div></div><div className="messages">{messages.map((message, index) => <div key={index} className={`message ${message.from}`}><small>{message.from === "author" ? "作者" : actor}</small><p>{message.text}</p></div>)}</div><form className="chat-input" onSubmit={sendMessage}><input name="prompt" placeholder={`试着质问${actor}，测试角色反应……`} autoComplete="off" /><button type="submit">发送 ↵</button></form></section>
    <aside className="test-notes"><h3>测试建议</h3><div className="test-card"><span>01</span><p><b>压力测试</b><small>直接指出秘密，观察角色是否过早承认。</small></p></div><div className="test-card"><span>02</span><p><b>关系测试</b><small>提到另一角色，检查态度是否符合关系图。</small></p></div><div className="test-card"><span>03</span><p><b>动机测试</b><small>提供另一种选择，检查行动是否仍然合理。</small></p></div><div className="prototype-note">当前为规则驱动原型。下一阶段接入大模型，并将每次跑偏标记为角色设定缺口。</div></aside></div>;
}

function CaseStudy() {
  return <div className="case-study"><section className="case-hero"><div><span className="case-label">PRODUCT CASE STUDY · 2026</span><h2>把“和 AI 聊天写剧本”<br />变成可验证的创作系统</h2><p>面向剧本杀作者的关系、时间、线索与角色一致性工作台。</p></div><div className="case-metric"><strong>4</strong><span>个高频创作任务<br />集中在一个工作流</span></div></section>
    <div className="case-columns"><section><span className="section-number">01</span><h3>问题不是缺少灵感，<br />而是无法维护复杂一致性</h3><p>长篇创作中，角色关系、动线、线索和对白分散在 Word、表格与作者脑中。通用聊天 AI 能生成内容，却不能持续回答“这次修改破坏了什么”。</p></section><section><span className="section-number">02</span><h3>产品判断</h3><ul><li><b>从生成转向验证：</b>优先检测冲突与失衡，而不是再加一个聊天框。</li><li><b>从文档转向对象：</b>角色、关系、事件、线索都有结构化身份。</li><li><b>从单次回答转向项目状态：</b>每次修改都更新整部作品的健康度。</li></ul></section></div>
    <section className="workflow-strip"><div><span>1</span><b>人物关系</b><small>看清矛盾网络</small></div><i>→</i><div><span>2</span><b>时间线</b><small>验证行动可能性</small></div><i>→</i><div><span>3</span><b>线索平衡</b><small>控制怀疑节奏</small></div><i>→</i><div><span>4</span><b>角色模拟</b><small>测试对白一致性</small></div></section>
    <div className="case-columns lower"><section><span className="section-number">03</span><h3>MVP 成功指标</h3><div className="metric-list"><div><b>−40%</b><span>作者手工核对动线的时间</span></div><div><b>≥80%</b><span>系统冲突提示被作者判定有效</span></div><div><b>2×</b><span>单轮内测可发现的逻辑问题数</span></div></div></section><section><span className="section-number">04</span><h3>路线图</h3><div className="roadmap"><div className="done"><b>MVP · 现在</b><p>关系图、冲突检测、线索平衡、规则式角色模拟</p></div><div><b>Next</b><p>导入 Word / Obsidian，自动抽取角色与事件</p></div><div><b>Later</b><p>多人协作、版本差异、AI 跑团内测报告</p></div></div></section></div>
    <footer className="case-footer"><div><b>我的角色</b><span>产品定义 · 信息架构 · 交互原型 · 指标设计</span></div><div><b>验证素材</b><span>《无喙镜渊》5 份真实创作文档</span></div><button className="primary-btn">查看可交互原型 ↑</button></footer>
  </div>;
}
