"use client";

import { useEffect, useMemo, useState } from "react";
import "./phone.css";
import "./game-overrides.css";
import "./image-overrides.css";
import "./social-overrides.css";
import "./social-text-overrides.css";
import "./news-overrides.css";
import SocialRecordsScreen from "./social-records";
import { dmRoleScripts as allRoleScripts } from "./dm-role-scripts";
import {
  getRoom,
  updatePlayerTokens,
  type RoomState,
} from "./room-api";
import "./lock-overrides.css";
import "./search-overrides.css";
import "./script-overrides.css";
import "./social-records-overrides.css";
import "./retro-overrides.css";

type PlayerRole = "向沉" | "胡谋" | "章貘" | "朱渴焰" | "牛守拙";
type AppKey =
  | "home"
  | "script"
  | "search"
  | "lock"
  | "games"
  | "archive"
  | "social"
  | "encyclopedia"
  | "tarot"
  | "news"
  | "rumor"
  | "memory"
  | "notes"
  | "hacker"
  | "job"
  | "detective"
  | "eco"
  | "backdoor";
type SearchFilter =
  | "全部"
  | "第一轮"
  | "第二轮"
  | "深层线索"
  | "看看别人"
  | "其他"
  | "搜人"
  | "搜地点"
  | "我搜到的"
  | "别人搜到的"
  | "已公开";

const apps: {
  key: AppKey;
  icon: string;
  iconImage?: string;
  label: string;
  meta: string;
  tone: string;
}[] = [
  {
    key: "archive",
    icon: "档",
    iconImage: "/app-icons/zhuyeyan-tasks.png",
    label: "今日任务",
    meta: "向沉",
    tone: "violet",
  },
];

const commonApps: {
  key: AppKey;
  icon: string;
  iconImage?: string;
  label: string;
  meta: string;
  tone: string;
}[] = [
  {
    key: "encyclopedia",
    icon: "千",
    iconImage: "/app-icons/baidu-qianke.png",
    label: "百度千科",
    meta: "AI百科 · 动物百科 · 希腊神话",
    tone: "cyan",
  },
  {
    key: "news",
    icon: "近",
    iconImage: "/app-icons/toutiao.png",
    label: "近日头条",
    meta: "靠谱新闻 · 离谱传闻",
    tone: "coral",
  },
  {
    key: "social",
    icon: "书",
    iconImage: "/app-icons/xiaohongshu.png",
    label: "小蓝书",
    meta: "生活痕迹",
    tone: "violet",
  },
  {
    key: "tarot",
    icon: "塔",
    iconImage: "/app-icons/taluosi.png",
    label: "塔罗斯5438",
    meta: "有限回答 · 系统终端",
    tone: "gold",
  },
];

const roleApps: Record<
  PlayerRole,
  {
    key: AppKey;
    icon: string;
    iconImage?: string;
    label: string;
    meta: string;
    tone: string;
  }
> = {
  胡谋: {
    key: "hacker",
    icon: "码",
    iconImage: "/app-icons/humou-programming.png",
    label: "编程",
    meta: "本地程序",
    tone: "hacker",
  },
  牛守拙: {
    key: "job",
    icon: "聘",
    iconImage: "/app-icons/niushouzhuo-daily-find.png",
    label: "天天找",
    meta: "职位信息",
    tone: "job",
  },
  向沉: {
    key: "detective",
    icon: "探",
    iconImage: "/app-icons/xiangchen-justice-notes.png",
    label: "正义笔记",
    meta: "案件资料",
    tone: "detective",
  },
  章貘: {
    key: "eco",
    icon: "E",
    iconImage: "/app-icons/zhangmo-echo.png",
    label: "Echo",
    meta: "本地",
    tone: "eco",
  },
  朱渴焰: {
    key: "archive",
    icon: "档",
    iconImage: "/app-icons/zhuyeyan-tasks.png",
    label: "今日任务",
    meta: "朱渴焰",
    tone: "violet",
  },
};
const backdoorApp: {
  key: AppKey;
  icon: string;
  label: string;
  meta: string;
  tone: string;
} = {
  key: "backdoor",
  icon: "门",
  label: "塔洛斯后门",
  meta: "终局后 · 仅胡谋",
  tone: "red",
};

const chapters = [
  {
    title: "第一幕 · 镜渊初醒",
    state: "已解锁",
    text: "喷泉把黑夜折成倒影。五个人醒在静夜园，节目台本要求你们先讲述自己的原罪。",
  },
  {
    title: "第二幕 · 幼儿园样本",
    state: "已解锁",
    text: "一楼的孩子被编号、分班、观察。有人被奖励，有人被带走，有人的哭声被录成节目。",
  },
  {
    title: "第三幕 · 案发当晚",
    state: "部分解锁",
    text: "陆驰寂死在书房。每个人都看见了一间书房，却没有人能证明那是同一间。",
  },
];

const firstActScripts: Partial<
  Record<
    PlayerRole,
    { title: string; sections: { title: string; body: string }[] }
  >
> = {
  向沉: {
    title: "DAY-1 · 第一幕",
    sections: [
      {
        title: "A · 小剧场 / 开场白",
        body: `睁开眼是一片漆黑的镜像。那是庄园中心的喷泉，喷泉的水倒映着黑夜，像深不见底的深渊。水中自己的倒影看起来非常愤怒，好像在水底深处凝视着你。杨塔罗叫你们快点过去，别耽误节目的录制。虽然到达庄园时已经是深夜，但今天有三个游戏要录制完成。\n\n来到三楼西侧的游戏空间，大家陆续落座。\n\n牛守拙自我介绍：“我叫牛守拙，是塔罗公司的员工，代表原罪是懒惰。懒惰是人的本性，是人类进步的阶梯。懒人总想着怎么用最少的力气完成工作；重复多了，自然就能找到优化的空间。情绪影响效率，解决问题才是关键，问题解决了就可以休息了。”\n\n胡谋说：“我叫胡谋，是独立 AI 公司老板，代表原罪是暴食。”她看向章貘：“数据还原得好真实啊。”她继续按台词介绍：数据就是最好的食物和养料。海量原始数据样本只要够大，噪声自然会被均值吃掉，规律会从噪音里浮出来；量变引起质变，这就是她的工作习惯。\n\n轮到你。请按照节目给你的台词自我介绍；理解大意后可自由转述。\n\n“我叫向沉，AI 案件顾问，代表原罪是愤怒。愤怒是人类最强烈的情绪。忍气吞声等不来公道，人要主动争取、勇敢发声。尤其在数据当道的时代，数据得出的审判结论真的公平吗？概率模型得到有利于 95% 的结果，剩下 5% 的人就要理所应当地被放弃吗？人是有情感的生物，不是冰冷的数据。过度依赖数据会倾向一种极端。保持思考，保持愤怒，这是我坚守的理念。”\n\n章貘介绍自己是书店主理人，代表傲慢。她说所有问题一定已经有人解决，人能做的是筛选、排列、组合；她的存在由品味与选择组合而成。\n\n朱渴焰说自己是塔罗公司的业务人员，代表色欲。她解释：不是通常意义上的色欲，而是渴望与人产生交集、感受情感的连接；在人和人彼此看见的一刻，真实的自己才会从关系的缝隙里透出来。`,
      },
      {
        title: "B · 游戏 1",
        body: `游戏一：奶茶游戏。胜者指定三人获得 20K Token；你不参与。\n\n游戏二：帽子游戏。报名消耗 10K Token，座位另行竞拍；猜出自己帽子颜色者获得奖励。\n\n游戏三：三个金条。答对者获得 10K Token。\n\n你的初始 Token：90K。`,
      },
      {
        title: "C · 梦",
        body: `来庄园的第一晚你做了一个梦。\n\n你们围绕着喷泉，剩下四人在黑夜中变得模糊，喷泉里的水黑的可怕，像要把一切都吞噬进去，突然有人把你推入水中，水面如镜面般四分五裂，你瞬间惊醒。\n\n“静夜园，无喙境。镜无完人，相顾何言。” 诡异的童声传来了恐怖的歌谣。 \n你的腿被拴在木桩上，挣不脱。绳子勒进肉里，腿很疼，木桩纹丝不动。木桩早就朽了，绳子早就断了。你有庞大力量，可你挣脱不了。\n有人骑在你背上，你朝着他手指的地方前进，走着走着，看到路边有一堆白色的东西，你停下来，你认识这堆骨头。你感觉鼻头一酸。\n骑在你背上的人扯你的耳朵，让你继续走。你想把骨头卷起来带走。\n\n你醒来了。原来是梦中梦。手不自觉地摸腿，你知道那骨头是你的。\n \n你醒来了，原来是梦中梦。手不自觉地摸头顶。什么也没有。`,
      },
      {
        title: "D · 回忆",
        body: `• 你是一个为达目的不择手段的人\n• 你是一个关注“小事”的警察，你捍卫少数人的利益\n• 你有一个女儿叫向阳花，被ai误诊就病逝了。\n• 你的妻子认为女儿没死，最后在找女儿的路上失踪了\n\n• 你和老贺一起调查塔罗公司，老贺在一次任务中牺牲了\n• 你下载了虚拟聊天软件，向阳花每天和你聊天。\n• 你做了个女儿的模型，想给向阳花升级\n\n\n• 你使用违法的ai协助办案调查，与四色笔是合作关系。\n• 你发现虚拟聊天软件违法收集数据，也是四色笔所为。\n\n• 你调查塔罗公司，朱渴焰劝你收手。\n• 你开始使用九键手机，接受陆驰寂邀请来到了庄园。`,
      },
    ],
  },
  胡谋: {
    title: "DAY-1 · 第一幕",
    sections: [
      { title: "A · 小剧场 / 开场白", body: "见小剧场。" },
      { title: "B · 游戏 1", body: "见小游戏 App。" },
      {
        title: "C · 梦",
        body: `来庄园的第一晚你做了一个梦。\n你们围绕着喷泉，剩下四人在黑夜中变得模糊，喷泉里的水黑的可怕，像要把一切都吞噬进去，突然有人把你推入水中，水面如镜面般四分五裂，你瞬间惊醒。\n\n“静夜园，无喙境。镜无完人，相顾何言。” \n诡异的童声传来了恐怖的歌谣。 \n\n你在树根下面闻到食物的味道，甜腻腻的。你假装受伤，一瘸一拐。懵懂的食物从洞口探出头。\n\n后颈一紧。一只手把你提起来，翻过身，剪刀尖抵住胸口。你拼命挣扎，那人掐住你后颈某个位置，剪刀从胸口划到肚子，皮毛整张剥下来。你突然觉得困。有什么东西在你后脑勺下面，一种酥麻麻的感觉，像被什么东西从里面轻轻蜇了一下。你不想挣扎了。你觉得这个手很暖和。你低头看见自己的肌肉，肋骨，还在跳的心脏，开膛的身体，你想起那双懵懂的眼睛。\n\n \n你醒来了，原来是梦中梦。手不自觉地摸胸口。什么也没有。`,
      },
      {
        title: "D · 回忆",
        body: `• 童年的记忆很模糊，只记得有个疯女人要来抓走你，被打死了。\n• 你母亲得了重病，你开始不择手段的赚钱。\n• 你开始偷东西。利用同情心挣钱。但母亲还是离世了\n• 你习惯了赚钱，开始收集信息，建立信息咨询公司赚钱\n\n• 你创建Echo软件，收集人们情感信息\n• 你与章貘在一起了，没多久就分开了\n• 你把收集到的用户数据数据卖给了塔罗公司\n• 你的软件被查封，你被向沉警官调查\n\n• 你与陆驰寂谈合作被拒绝，朱渴焰招募你入职，你拒绝。那次见面，朱渴焰送给你一个花朵形状的玩偶。你把它接过来，觉得这份礼物不像公司的标准流程。朱渴焰看着你的时候，似乎并不只是在看一份资料。\n• 陆驰寂邀请你来庄园参与节目录制，并讨论进一步合作`,
      },
    ],
  },
  章貘: {
    title: "DAY-1 · 第一幕",
    sections: [
      { title: "A · 小剧场 / 开场白", body: "见小剧场。" },
      { title: "B · 游戏 1", body: "见小游戏 App。" },
      {
        title: "C · 梦",
        body: `来庄园的第一晚你做了一个梦。\n你们围绕着喷泉，剩下四人在黑夜中变得模糊，喷泉里的水黑的可怕，像要把一切都吞噬进去，突然有人把你推入水中，水面如镜面般四分五裂，你瞬间惊醒。\n\n“静夜园，无喙境。镜无完人，相顾何言。” 诡异的童声传来了恐怖的歌谣。 \n\n你被关在玻璃后面。玻璃外面的人在看你你听不见声音。\n你不明白为什么自己的肢体在不听使唤的乱动。\n有人把手贴在玻璃上，你的手指犹豫了一下，轻轻碰了上去，暖暖的。\n然后那只手拿来了探针，伸进来，扎进去，轻轻一挑，你的手指断了，被取出来放在托盘上依旧在动。\n\n你醒来了。原来是梦中梦。不自觉蜷自己的手指。都在，都只听你的。`,
      },
      {
        title: "D · 回忆",
        body: `• 你喜欢奇怪的东西，你喜欢有人听你说话。你不喜欢异样的眼光。\n• 你天生六指，你自己切断了一指，因操作不当失去了整个左手。\n• \n• 你喜欢养一些奇怪的小动物，喜欢读各种书，喜欢收集刑具\n• 热力学第二定律非常浪漫，你组合创造了“鹤”。\n• 在书店的工作，你认识了胡谋，她和鹤有几分相似。\n• \n• 你利用ai和鹤对话聊天。\n• 智能假手改变了你的生活，鹤从此有了自己的身体。\n• 鹤被删除了，你恢复了部分数据，但不完整的鹤让你感到痛苦。\n• \n• 陆驰寂说庄园有最后一份鹤的数据，邀请你来到了庄园。`,
      },
    ],
  },
  朱渴焰: {
    title: "DAY-1 · 第一幕",
    sections: [
      { title: "A · 小剧场 / 开场白", body: "见小剧场。" },
      { title: "B · 游戏 1", body: "见小游戏 App。" },
      {
        title: "C · 梦",
        body: `来庄园的第一晚你做了一个梦。\n你们围绕着喷泉，剩下四人在黑夜中变得模糊，喷泉里的水黑的可怕，像要把一切都吞噬进去，突然有人把你推入水中，水面如镜面般四分五裂，你瞬间惊醒。\n\n“静夜园，无喙境。镜无完人，相顾何言。” 诡异的童声传来了恐怖的歌谣。 \n\n笼子是冷的，灯是白的，你蜷在角落里，有人走过来，你抬起头。\n你跟着他走。走廊很长，去哪。但他的鞋跟敲在地板上，节奏很稳，你跟着那个节奏走。\n\n桌面是不锈钢的，很凉。你想坐起来，他的手按在你脖子上，很轻的那种按，像摸，又像固定。你舔了一下他的手腕。\n针扎进来。凉的液体顺着血管往上走，走到肩膀，走到心脏。你听见他说，乖，很快就好了。他的手很暖，你的眼皮很重。你想再舔一下他的手腕，舌头伸不出来。\n \n你醒来了，原来是梦中梦。枕套是凉的，像不锈钢桌面。`,
      },
      {
        title: "D · 回忆",
        body: `你的记忆非常破碎，你记得儿时父亲养猪。\n你喜欢小动物。\n\n导师，杨塔罗是你的老板，但他更像是你的导师，\n杨塔罗直接安排你工作，你协助他做一些生物实验。\n你总是梦见他，好像就在这庄园里，但你应该是第一次来。\n\n陆驰寂是你的同事，她是个本质善良的女强人，\n你通知牛守拙被辞退，他让你感到亲切。\n公司安排你采访章貘，你见到她心跳的很快。\n公司安排你和向沉沟通，她让你想到父亲。\n公司安排你招募胡谋，胡谋和你很聊得来。\n\n你的记忆和情绪越来越割裂，公司给你安排的业务千奇百怪。`,
      },
    ],
  },
  牛守拙: {
    title: "DAY-1 · 第一幕",
    sections: [
      { title: "A · 小剧场 / 开场白", body: "见小剧场。" },
      { title: "B · 游戏 1", body: "见小游戏 App。" },
      {
        title: "C · 梦",
        body: `来庄园的第一晚你做了一个梦。\n你们围绕着喷泉，剩下四人在黑夜中变得模糊，喷泉里的水黑的可怕，像要把一切都吞噬进去，突然有人把你推入水中，水面如镜面般四分五裂，你瞬间惊醒。\n\n“静夜园，无喙境。镜无完人，相顾何言。” 诡异的童声传来了恐怖的歌谣。 \n不知道自己是什么，但你想奔跑，在没有天花板的地方。\n脚下是冰冷的水泥地，你感觉到头顶痒，胀，像是有什么东西要从骨头里顶出来。\n \n有人来了。你张嘴求救，发不出声音。\n那人用刀子从你头顶挖下去，钻心的痛，鲜血从头顶流下来。\n那东西从头顶再长，鲜血再流，再长，再流。\n \n你醒来了，原来是梦中梦。手不自觉地摸头顶。什么也没有。`,
      },
      {
        title: "D · 回忆",
        body: `• 你并不懒惰，你是一个认真工作的人，你换过三次工作。\n• 你有一个女儿，很小就病逝了。\n\n• 工作一，物流公司仓管员。后来，你和老贺一起失去了工作。\n• 你下载了虚拟聊天软件，和人聊天没多久觉得没意思就卸载了。\n• 你给当时导致自己被开除的人发了邮件，收到了等消息的回复。\n\n• 工作二，库存周转，同样的原因又被开除了。\n• 你继续发邮件，得到同样的回复。你把自己的工作成果卖了出去，结果被骗了。\n\n• 工作三你来到了塔罗公司，认识了朱渴焰，见到了陆驰寂。同样的原因又被开除了。\n\n• 你终于开始学着做银器，各种残缺的动物，非常精美。\n• 你等到了回复，一个很好的工作机会，陆驰寂邀请你来到了庄园。`,
      },
    ],
  },
};

const evidenceSeed = [
  {
    id: "P-01",
    kind: "搜人",
    title: "向沉 · 旧式九键手机",
    body: "没有云端同步，只保存他不允许别人改写的真相。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-02",
    kind: "搜人",
    title: "胡谋 · 按动笔",
    body: "一支按动笔，笔身印着小王子和小狐狸。按下时会发出咔哒声。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-03",
    kind: "搜人",
    title: "章貘 · 章鱼玩偶",
    body: "玩偶的触手被反复摸过，像是在确认某个已经失联的存在。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-39",
    kind: "搜人",
    title: "章貘 · 章鱼眼戒指",
    body: "绿色眼睛形状的章鱼戒指，触手部分有明显磨损。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-40",
    kind: "搜人",
    title: "章貘 · 两只手镯",
    body: "一只银色手镯，另一只材质和年代不明，表面有旧的使用痕迹。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-41",
    kind: "搜人",
    title: "章貘 · 热力学第二定律笔记",
    body: "关于熵、组合和不可逆过程的阅读笔记，页边写满了自己的批注。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-42",
    kind: "搜人",
    title: "章貘 · 家中饲养的动物",
    body: "家里养着水母、蜜蜂、章鱼、蛇等奇怪动物，一些甚至有剧毒。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-44",
    kind: "搜人",
    title: "章貘 · 同学录",
    body: "同学评价大多提到她与别人不一样，不容易相处，也很少有人真正理解她。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-45",
    kind: "搜人",
    title: "章貘 · 书店评价",
    body: "顾客评价较高，认为她选书准确、专业，能推荐适合自己的书。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-46",
    kind: "搜人",
    title: "章貘 · 与胡谋的合照",
    body: "章貘与胡谋在书店内的合照，拍摄时间不明。两人看起来关系亲密。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-47",
    kind: "搜人",
    title: "章貘 · Echo 排名记录",
    body: "Echo 用户排名中，“鹤”长期位于高位，互动稳定性和回应完成度均异常突出。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-48",
    kind: "搜人",
    title: "章貘 · 与鹤的聊天截图",
    body: "大量聊天记录截图，内容涉及存在、理解、章鱼和她们之间的关系。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-49",
    kind: "搜人",
    title: "章貘 · 塔罗公司调查资料",
    body: "关于 Echo、意识天堂和塔罗公司数据项目的调查记录。部分页面标注为待核实。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-50",
    kind: "搜人",
    title: "朱渴焰 · 日记",
    body: "日记中反复记录奇怪的梦。梦里出现一只小猪，以及她和杨塔罗的对话。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-51",
    kind: "搜人",
    title: "朱渴焰 · 比格犬照片",
    body: "照片里有很多只比格犬。她在每只狗旁边用笔写下了名字。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-52",
    kind: "搜人",
    title: "朱渴焰 · 工作安排",
    body: "塔罗公司业务员。没有固定工种，业务、接待、实验室协助和资料整理等工作都曾做过。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-53",
    kind: "搜地点",
    title: "朱渴焰家 · 动物布偶",
    body: "家中各处摆放着不同动物的布偶，部分来自塔罗公司项目，部分没有来源记录。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-54",
    kind: "搜人",
    title: "朱渴焰 · 塔罗公司调查文件",
    body: "电脑文档中保存着对塔罗公司项目、员工权限和意识天堂的调查资料。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-55",
    kind: "搜人",
    title: "朱渴焰 · 同事评价（一）",
    body: "她非常热情、风趣幽默，喜欢和年长男性以及外貌好看的女性相处，也很擅长让陌生人放下戒心。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-56",
    kind: "搜人",
    title: "朱渴焰 · 同事评价（二）",
    body: "她偶尔会出现明显的性格变化：说话方式、情绪反应和对人的态度，像突然换了一个人。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-57",
    kind: "搜地点",
    title: "朱渴焰家 · 书架",
    body: "书架上有大量关于存在、梦境、意识和情绪控制的书。部分书页被折角或写满批注。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-58",
    kind: "搜人",
    title: "朱渴焰 · 存在主义书目",
    body: "《存在不需要证明》《梦里的人会记得你吗》《意识是连续的吗》《一个人如何成为另一个人》。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-59",
    kind: "搜人",
    title: "朱渴焰 · 情绪控制书目",
    body: "《情绪的回声》《如何与不可预测的自己相处》《在失控之前呼吸》《亲密关系中的情绪替身》。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-60",
    kind: "搜人",
    title: "朱渴焰 · 多重工作权限",
    body: "员工权限记录显示，她曾在多个部门短期工作，接触过业务、实验、资料和节目执行等不同系统。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-61",
    kind: "搜人",
    title: "向沉 · 近期失踪人口调查报告",
    body: "数个 AI 反动组织宣称成员近日失踪。向沉继续核查后发现，失踪者远不止这些组织成员；他们大多属于系统评估中的低价值、低优先级人群，案件长期没有得到充分调查。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-75",
    kind: "搜人",
    title: "向沉 · 陆驰寂医疗记录",
    body: "陆驰寂已确诊癌症，病情进入晚期；同时，她已被塔罗公司解除职务，另有数起案件仍在调查中。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-76",
    kind: "搜人",
    title: "胡谋 · VR 保护措施档案",
    body: "胡谋调查到的一份内部档案，标题为《VR 体验保护措施》。（可深入调查）",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-62",
    kind: "看看别人",
    title: "看看别人 · 向沉",
    body: "长相特点：疲惫、警惕，长期保持观察姿态。\n既往关系：前刑警，与老贺共同调查过塔罗公司；曾与朱渴焰接触。\n浏览记录：低价值案件、失踪者名单、病历修改记录。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "P-63",
    kind: "看看别人",
    title: "看看别人 · 胡谋",
    body: "长相特点：年轻，眼神灵活，习惯先观察再回应。\n既往关系：与章貘曾有亲密关系；购买过牛守拙的资料。\n浏览记录：假监控生成、匿名账户、Echo 用户数据、塔罗公司权限。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "P-64",
    kind: "看看别人",
    title: "看看别人 · 章貘",
    body: "长相特点：安静，动作慢，习惯长时间观察物品。\n既往关系：与胡谋曾经交往；与鹤保持长期联系。\n浏览记录：Echo 排名、鹤的聊天记录、塔罗公司调查资料。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "P-65",
    kind: "看看别人",
    title: "看看别人 · 朱渴焰",
    body: "长相特点：热情、健谈，能够迅速拉近与陌生人的距离。\n既往关系：塔罗公司业务员，曾邀请牛守拙参加节目。\n浏览记录：陆驰寂认罪素材、牛守拙资料、节目流程和公司内部文件。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "P-66",
    kind: "看看别人",
    title: "看看别人 · 牛守拙",
    body: "长相特点：沉默、疲惫，做事反复核对。\n既往关系：曾在多个岗位工作，近期被塔罗公司 AI 替代。\n浏览记录：招聘信息、女儿死亡记录、AI 误诊资料。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "L-03",
    kind: "其他",
    title: "静夜园 · 三层庄园地图",
    body: "建筑为南向开口的三层 C 形结构，西、北、东三侧体块围合中央花园，三侧均长廊贯通。\n一层：北翼挑空门厅；西翼客房；东翼监控门禁室、比格犬实验室、仓库设备间。\n二层：西翼客房；东翼杨塔罗卧室、办公室、意识实体观察室，卧室内有隐藏终端和维持舱。\n三层：西翼餐厅；北翼三开间书房；东翼 301 道具间、302 控制室、303 办公室。东侧楼梯与密道通往道具间、控制室和资料室区域。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "L-05",
    kind: "搜地点",
    title: "案发现场 · 斧头",
    body: "一把斧头被留在案发现场。斧刃和木柄上留有使用痕迹，来源指向三层 301 道具间。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "P-28",
    kind: "搜人",
    title: "向沉 · 警局评价",
    body: "长期关注系统评估为低价值、低优先级的案件。办案效率高，但取证和调查手段多次被认为不够规范。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-29",
    kind: "搜人",
    title: "向沉 · 向阳花看表演的记录",
    body: "票据显示，向阳花曾观看海豚表演和大象表演。票根被单独收在旧文件夹中。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-30",
    kind: "搜人",
    title: "向沉 · 向阳花死亡记录",
    body: "姓名：向阳花。死亡年龄：五岁。诊断记录：低风险。死亡记录与 AI 误诊有关，病例背面写着：「必须有人负责」。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-31",
    kind: "搜人",
    title: "向沉 · 妻子失踪案与老贺调查记录",
    body: "妻子在寻找向阳花相关线索的途中失踪，案件长期没有明确结论。此后，向沉与老贺共同调查过塔罗公司及相关数据链。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-35",
    kind: "搜人",
    title: "向沉 · 向阳花等身模型",
    body: "一具按照向阳花外貌制作的等身模型，看起来有些诡异。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-36",
    kind: "搜人",
    title: "向沉 · 大象玩偶",
    body: "一只大象玩偶，被放在大门外面。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-38",
    kind: "搜人",
    title: "向沉 · 改装电棍",
    body: "便携式电棍，内部经过改装，外壳有多次拆卸痕迹。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-14",
    kind: "搜人",
    title: "胡谋 · 母亲的病历",
    body: "长期治疗记录，病历夹边角磨损严重。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-15",
    kind: "搜地点",
    title: "胡谋家 · 小鸡",
    body: "院子里养着几只小鸡，饲养箱、饲料和饮水器都放在门边。其中一只叫葵葵，被照顾得很好。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-16",
    kind: "搜人",
    title: "胡谋 · 银行卡",
    body: "银行卡数量很多，分别来自不同银行。居住环境并不富裕，卡片却被分类保存。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-17",
    kind: "搜地点",
    title: "胡谋家 · 资料堆",
    body: "房间里堆满软件文档、用户资料、合同和打印记录，几乎没有空出的桌面。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-19",
    kind: "搜人",
    title: "胡谋 · AI 伪造证据记录",
    body: "记录显示，她曾使用程序生成监控截图、聊天记录和时间线，用于伪造证据。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-20",
    kind: "搜人",
    title: "胡谋 · 用户沟通记录",
    body: "Echo 用户的咨询、依赖、隐私和交易记录。部分记录涉及向沉。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-21",
    kind: "搜人",
    title: "胡谋 · 合作邮件",
    body: "胡谋曾向陆驰寂发邮件询问合作。回复：已收到，相关内容将由公司评估后联系。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-22",
    kind: "搜地点",
    title: "胡谋家 · 黑客架",
    body: "显示器、硬盘、网线和多台旧设备组成的工作台。设备上保留着 Echo 的本地备份。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-23",
    kind: "搜人",
    title: "胡谋 · 小狐狸玩偶",
    body: "一只小狐狸玩偶，放在软件开发设备旁边。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-24",
    kind: "搜地点",
    title: "胡谋家 · 母亲的照片与小盒子",
    body: "一张女人的黑白照片，太宰一个木头盒子上，但女人长得并不像胡谋。旁边的盒子被盘得光滑油润，盒内疑似保存着母亲的遗物或骨灰。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-26",
    kind: "搜人",
    title: "胡谋 · 公司查封记录",
    body: "Echo 所属公司曾被查封，并接受过多次审查。文件中多处出现数据合规与隐私交易问题。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-04",
    kind: "搜人",
    title: "牛守拙 · 被辞职记录",
    body: "工作一：物流仓管。岗位被塔罗公司 AI 智能分拣系统替代。\n工作二：库存管理。岗位被塔罗公司 AI 排程系统替代。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-05",
    kind: "搜人",
    title: "牛守拙 · 银制动物",
    body: "银制动物饰品若干：断角的鹿、无嘴的鸟、残缺的小牛。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-06",
    kind: "搜人",
    title: "牛守拙 · 农场照片",
    body: "儿时在养殖厂的照片，和牛、羊、猪的合照，随着年纪增长笑容越来越少。其中一张格外开心：牛守拙与一头奶牛站在农场牛棚前，照片背面标注：阿花。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-07",
    kind: "搜人",
    title: "牛守拙 · 女儿死亡证明",
    body: "姓名：牛晓。死亡年龄：六岁。诊断记录：普通病毒感染，低风险。病例背面写着：「没办法」。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-08",
    kind: "搜人",
    title: "牛守拙 · 离婚证",
    body: "登记原因为长期分居、感情破裂。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-09",
    kind: "搜人",
    title: "牛守拙 · 邮件记录",
    body: "多次发给陆驰寂的邮件。回复基本相同：已收到，正在处理，请等待消息。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-10",
    kind: "搜人",
    title: "牛守拙 · 小鹿布偶",
    body: "朱渴焰赠送。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-11",
    kind: "搜人",
    title: "章貘 · 旧工作流程表",
    body: "绿色：安全。橙色：预警。红色：警告。绿转橙预留六小时缓冲，不可再压。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-67",
    kind: "搜人",
    title: "章貘 · 案发后状态",
    body: "她的袖子很长，左手始终没有露出来。右手仍戴着章鱼眼戒指，只是原本绿色的眼睛已经变成了黑色。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-68",
    kind: "搜人",
    title: "胡谋 · 案发后状态",
    body: "她的手指有擦伤。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-69",
    kind: "搜人",
    title: "向沉 · 案发后状态",
    body: "他满头是汗，衣领也被汗水洇湿；即使停下来，眼神仍在不断扫视四周。",
    status: "未公开",
    owner: "向沉",
  },
  {
    id: "P-70",
    kind: "搜人",
    title: "牛守拙 · 案发后状态",
    body: "他看起来有些茫然，像还没有从刚才发生的事里反应过来。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-71",
    kind: "搜人",
    title: "朱渴焰 · 案发后状态",
    body: "她看到尸体后的反应最剧烈，脸色发白，几乎无法掩饰难受和恐惧。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-72",
    kind: "搜地点",
    title: "牛守拙房间 · 银制动物",
    body: "房间内放着一个还没有刻完的银制动物。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-73",
    kind: "搜人",
    title: "牛守拙 · 档案袋",
    body: "牛守拙带着一个档案袋，里面保存着多份纸质资料。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-74",
    kind: "搜人",
    title: "牛守拙 · 争执目击",
    body: "有人听见牛守拙曾与胡谋发生争执。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "D-01",
    kind: "其他",
    title: "内部资料 · VR 体验说明",
    body: "体验者需佩戴眼罩，坐入类似按摩椅的接入设备。系统会同步多种真实感受；长时间体验后，使用者可能暂时混淆自身身份。健康人类在体验中受到三次致命伤后，现实生活中的身体也会死亡。说明同时标注了安全保护措施与时长限制。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "D-02",
    kind: "其他",
    title: "内部资料 · 休眠舱",
    body: "接入设备会在体验期间维持人体基础状态。舱体外部无法辨认使用者身份，只能确认其中有人仍处于连接状态。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "D-03",
    kind: "其他",
    title: "内部资料 · 意识天堂实验招募",
    body: "“意识天堂”仍处于实验阶段。为让其中的路人与互动具有接近真实人类的情感和行动反应，项目正在招募自愿参与者，并以真实人类意识作为训练材料。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "D-04",
    kind: "其他",
    title: "项目简报 · 意识天堂",
    body: "这是一个充满争议的意识上传项目：参与者可以选择将意识保存至储存盘，以获得“赛博永生”。塔罗公司近期正在推进试验，项目面临法律障碍，但已有传言称有人正在私下使用。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "D-05",
    kind: "其他",
    title: "内部资料 · 虚拟后门",
    body: "除从现实世界手动退出 VR 外，模拟内部还保留一条后门。虚拟世界中的使用者可借此触发唤醒程序，使现实中的身体恢复清醒。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "D-06",
    kind: "其他",
    title: "内部资料 · 情绪耗材计划",
    body: "为训练 AI 对人类情绪的模拟能力，公司将被关押者、无亲属或难以追查者，以及被判定具有高训练价值的人纳入反复运行的虚拟情境。系统记录他们在自认为真实的处境中作出的反应，并将这些反应作为模型训练材料；内部统称为“情绪耗材”。",
    status: "未公开",
    owner: "公共",
  },
  {
    id: "L-06",
    kind: "搜地点",
    title: "案发现场 · 现场照片",
    body: "书房内灯光、桌面、镜面与窗户的位置均被完整拍下。",
    status: "未公开",
    owner: "公共",
    image: "/script-images/crime-scene.jpeg",
  },
  {
    id: "L-07",
    kind: "搜地点",
    title: "案发现场 · 尸体照片与初检",
    body: "初步判断：死因与窒息及钝器撞击共同有关。颈部和头部均留有损伤，单一伤口无法解释全部死亡反应。",
    status: "未公开",
    owner: "公共",
    image: "/script-images/body-photo.jpeg",
  },
  {
    id: "L-08",
    kind: "搜地点",
    title: "第二书房 · 打碎的台灯",
    body: "地上有一盏被打碎的台灯。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-09",
    kind: "搜地点",
    title: "第二书房 · 通风管道",
    body: "通风管道有近期使用过的痕迹，可以继续深入调查。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-10",
    kind: "搜地点",
    title: "第二书房 · 通风管道深入调查",
    body: "通风管道内发现一条死蛇。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-11",
    kind: "搜地点",
    title: "尸体检查 · 两个孔洞",
    body: "尸体脖颈处有两个孔洞。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-12",
    kind: "搜地点",
    title: "尸体检查 · 颈部出血",
    body: "尸体脖颈处有大量出血。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-13",
    kind: "搜地点",
    title: "尸体检查 · 多种毒素",
    body: "尸体体内含有多种毒素。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "L-14",
    kind: "搜地点",
    title: "第二书房 · 铜刻针",
    body: "地上发现一根铜刻针。",
    status: "未公开",
    owner: "公共",
    hostOnly: true,
  },
  {
    id: "P-77",
    kind: "搜人",
    title: "章貘 · 错误指导记录",
    body: "一张病例报告，记录一次感染后的截肢处理，被标记为「新科技」指导失误。报告背面写着：「塞翁失马，感谢你让我遇见他」。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-78",
    kind: "搜人",
    title: "朱渴焰 · 动物实验工作日志",
    body: "工作日志：协助公司进行动物实验，实验犬被电击、毒杀、钝器击打、窒息等方式处理。文字平静，像在记录一件与己无关的流程。",
    status: "未公开",
    owner: "朱渴焰",
  },
  {
    id: "P-79",
    kind: "搜人",
    title: "牛守拙 · 供应链笔记",
    body: "「商品-不需要共情的痛苦」供应链管理课笔记：供应链讲求效益，不要对客体投射感情，生命的价值是明码标价的。一头奶牛寿命二十年，奶量第五年开始下降，第九年——饲料成本超过产出价值那年——被送去屠宰场。母牛在产奶量数据往下掉之前，步数会增多，这种恐慌焦虑导致的刻板行为叫「运动量异常波动」，镇静剂可尽快恢复进食。鹿茸作为珍贵药材在采割时不能打麻药，它们被反复采割，痛感和惊恐同样被生产流程遮蔽。",
    status: "未公开",
    owner: "牛守拙",
  },
  {
    id: "P-80",
    kind: "搜人",
    title: "胡谋 · 自欺欺人笔记",
    body: "「规律-自欺欺人笔记」：批量生产的肉鸡一生都活在一张 A4 纸大小的空间，互相啄羽、被剪喙。作为食物它们数量太多，没有名字只有编号，能挣钱才有价值。鸡的智商相当于两三岁人类幼儿，养作宠物则聪明可爱粘人——意义和价值因身份而不同。法则：狐狸会假装受伤一瘸一拐出现在鸡面前，鸡以为它跑不快，靠近后被暴起扑杀；狐狸养殖场里狐狸被关在窄笼中转身都困难，只被需要长毛，从没见过鸡。更聪明的一方掌握着下一等的命运。骗术：寄生蜂把卵产在毛毛虫体内，分泌化学物质让毛毛虫自愿留下来保护蜂的茧——让人信任才是更高明的骗局。",
    status: "未公开",
    owner: "胡谋",
  },
  {
    id: "P-81",
    kind: "搜人",
    title: "章貘 · 投射-无法理解的异类",
    body: "读书笔记：章鱼智商相当于人类五岁儿童，每条触手都有相对独立的神经处理能力，会用工具、会玩耍、会认人；人们觉得它太奇怪，不像哺乳动物的聪明容易被共情，章鱼的聪明是克苏鲁般不可名状。丹顶鹤一生只有一个伴侣，若伴侣死了，存活的鹤会离群，独自飞很长的路，在伴侣死去的地方反复盘旋；湿地公园剪掉鹤的羽毛不让迁徙，它依然张开翅膀助跑起跳，然后摔在地上，游客拍照说「这只鹤在跳舞」。",
    status: "未公开",
    owner: "章貘",
  },
  {
    id: "P-82",
    kind: "搜人",
    title: "朱渴焰 · 可悲的信任",
    body: "一张照片：白色背景下一群可爱的小狗，每一只都写上了名字，但都被划掉，只留下一个「花花」。工作日志：猪的智商相当于五岁人类儿童；养殖场里被喂养者亲手养大、长势却不达标的幼崽，要由喂养者亲手摔死。如果一次没摔死，小猪会摇摇晃晃站起来，回来蹭摔它的人的腿——它以为你不小心把它弄疼了。比格犬温顺、对人依恋，常被视为实验「适配」，它不会咬人、不会逃。",
    status: "未公开",
    owner: "朱渴焰",
  },
];

const filters: SearchFilter[] = [
  "全部",
  "第一轮",
  "第二轮",
  "深层线索",
  "看看别人",
  "其他",
  "搜人",
  "搜地点",
  "我搜到的",
  "别人搜到的",
  "已公开",
];

const cluePhase: Record<string, SearchFilter> = {
  "P-01": "第一轮",
  "P-02": "第一轮",
  "P-03": "第一轮",
  "P-04": "第一轮",
  "P-05": "第一轮",
  "P-06": "第一轮",
  "P-07": "第一轮",
  "P-08": "第一轮",
  "P-09": "第一轮",
  "P-10": "第一轮",
  "P-14": "第一轮",
  "P-15": "第一轮",
  "P-16": "第一轮",
  "P-17": "第一轮",
  "P-22": "第一轮",
  "P-23": "第一轮",
  "P-24": "第一轮",
  "P-28": "第一轮",
  "P-29": "第一轮",
  "P-30": "第一轮",
  "P-35": "第一轮",
  "P-36": "第一轮",
  "P-39": "第一轮",
  "P-40": "第一轮",
  "P-41": "第一轮",
  "P-42": "第一轮",
  "P-44": "第一轮",
  "P-45": "第一轮",
  "P-50": "第一轮",
  "P-51": "第一轮",
  "P-52": "第一轮",
  "P-53": "第一轮",
  "P-55": "第一轮",
  "P-56": "第一轮",
  "P-57": "第一轮",
  "P-58": "第一轮",
  "P-59": "第一轮",
  "P-62": "第一轮",
  "P-63": "第一轮",
  "P-64": "第一轮",
  "P-65": "第一轮",
  "P-66": "第一轮",
  "L-03": "深层线索",
  "L-05": "第二轮",
  "P-11": "第二轮",
  "P-19": "第二轮",
  "P-20": "第二轮",
  "P-21": "第二轮",
  "P-26": "第二轮",
  "P-31": "第二轮",
  "P-38": "第二轮",
  "P-46": "第一轮",
  "P-47": "第二轮",
  "P-48": "第二轮",
  "P-49": "第二轮",
  "P-54": "第二轮",
  "P-60": "第二轮",
  "P-61": "第二轮",
  "P-67": "第二轮",
  "P-68": "第二轮",
  "P-69": "第二轮",
  "P-70": "第二轮",
  "P-71": "第二轮",
  "P-72": "第二轮",
  "P-73": "第二轮",
  "P-74": "第二轮",
  "P-75": "第二轮",
  "P-76": "第二轮",
  "L-06": "第二轮",
  "L-07": "第二轮",
  "L-08": "第二轮",
  "L-09": "第二轮",
  "L-10": "第二轮",
  "L-11": "第二轮",
  "L-12": "第二轮",
  "L-13": "第二轮",
  "L-14": "第二轮",
  "D-01": "深层线索",
  "D-02": "深层线索",
  "D-03": "深层线索",
  "D-04": "深层线索",
  "D-05": "深层线索",
  "D-06": "深层线索",
  "P-77": "第二轮",
  "P-78": "第一轮",
  "P-79": "第一轮",
  "P-80": "第一轮",
  "P-81": "第一轮",
  "P-82": "第一轮",
};

const games = [
  {
    no: 1,
    act: 1,
    title: "奶茶游戏",
    host: "系统",
    cost: "免费",
    reward: "胜者可指定三人各获得 25K Token",
    rule: "共有 16 杯外观相同的奶茶，四名玩家参与，其中 1 杯加入了模拟泻药。玩家可以自由选择喝哪一杯，并在十分钟内讨论、制定方案后开始饮用。模拟泻药一小时后生效；一小时后，玩家根据各自的身体反应，判断哪一杯是目标奶茶。",
    access:
      "向沉、胡谋、章貘、朱渴焰参加；牛守拙不参与。仅为剧情模拟，不涉及真实饮用。",
    duration: 10,
  },
  {
    no: 2,
    act: 1,
    title: "帽子",
    host: "系统",
    cost: "报名 10K Token；选座另行竞价",
    reward: "成功猜出自己帽子者获得 30K Token",
    rule: "共三名玩家参加。章貘免费参加，其他玩家自愿报名并支付 10K Token；报名后继续竞价选择座位，座位由出价最高者获得。根据位置和他人反应，猜出自己帽子的颜色。",
    access: "章貘必须参加且免费；另外两人自愿报名。牛守拙可以报名。",
    duration: 10,
  },
  {
    no: 3,
    act: 1,
    title: "三个金条",
    host: "系统",
    cost: "免费",
    reward: "答对者获得 10K Token",
    rule: "三个盒子分别装有两根金条、一金一银、两根银条。随机选中一个盒子并随机摸出一根，已知摸出的是金条，问另一根也是金条的概率。",
    access: "所有玩家均可答题，包括牛守拙。",
    duration: 10,
  },
  {
    no: 4,
    act: 2,
    title: "红包来了",
    host: "胡谋",
    cost: "双方各支付 50K Token",
    reward: "每人拿到的红包积分自动加入自己的 Token",
    rule: "20 个红包排成一列。每回合只能从最前面拿 1–5 个，不能跳过。系统只提示：红包的数值可能会越来越大，但具体分值不公开。胡谋必须参加并先手，另一名玩家由 DM 指定，双方均支付 50K。",
    access: "胡谋必须参加且先手；另一人由 DM 点选并支付 50K。",
    duration: 10,
  },
  {
    no: 5,
    act: 2,
    title: "拍卖会",
    host: "向沉",
    cost: "起拍 50K Token",
    reward: "最高出价者获得拍品；向沉成功竞得后额外获得 5K Token",
    rule: "向沉必须参加，其他玩家自愿参加。所有人出价，价高者得；第二高出价者不获得拍品。",
    access: "向沉必须参加；其他玩家由 DM 点选。",
    duration: 10,
  },
  {
    no: 6,
    act: 2,
    title: "100K Token 分配投票",
    host: "朱渴焰",
    cost: "每人 20K Token",
    reward: "票数最高的分配方案执行",
    rule: "共三人参加。朱渴焰必须参加，另外两人由 DM 点选。三人各自提出一份把 100K Token 分给五人的方案，随后进行投票；每人不能投自己的方案，票数最高的方案执行。",
    access: "朱渴焰必须参加；另外两人由 DM 点选。三人均支付 20K Token。",
    duration: 10,
  },
  {
    no: 7,
    act: 2,
    title: "三开关与三灯泡",
    host: "牛守拙",
    cost: "免费",
    reward: "牛守拙成功解题获得 30K Token",
    rule: "房间外有三个开关，分别控制房间内的三个白炽灯。玩家只能打开房门一次，需要根据灯光状态和灯泡温度判断三个开关分别对应哪盏灯。",
    access: "牛守拙负责解题并参与；其他人由 DM 点选。",
    duration: 10,
  },
];

function FakeQr() {
  return (
    <div className="fake-qr" aria-label="原型二维码占位">
      {Array.from({ length: 81 }, (_, i) => (
        <i
          key={i}
          className={
            (i % 9 < 3 && Math.floor(i / 9) < 3) ||
            (i % 9 > 5 && Math.floor(i / 9) < 3) ||
            (i % 9 < 3 && Math.floor(i / 9) > 5) ||
            (i * 17) % 5 < 2
              ? "ink"
              : "paper"
          }
        />
      ))}
    </div>
  );
}

export default function PhoneApp() {
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [hostMode, setHostMode] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomMessage, setRoomMessage] = useState("");
  const [introComplete, setIntroComplete] = useState(false);
  const [active, setActive] = useState<AppKey>("home");
  const [screenTransitionState, setScreenTransitionState] = useState<
    "enter" | "exit"
  >("enter");
  const [filter, setFilter] = useState<SearchFilter>("全部");
  const [evidence, setEvidence] = useState(evidenceSeed);
  const [drawsByRole, setDrawsByRole] = useState<
    Record<PlayerRole, { first: number; second: number }>
  >({
    向沉: { first: 0, second: 0 },
    胡谋: { first: 0, second: 0 },
    章貘: { first: 0, second: 0 },
    朱渴焰: { first: 0, second: 0 },
    牛守拙: { first: 0, second: 0 },
  });
  const [unlockedDeepEvidenceIds, setUnlockedDeepEvidenceIds] = useState<
    string[]
  >([]);
  const [openChapter, setOpenChapter] = useState(-1);
  const [actOneScriptStage, setActOneScriptStage] = useState(0);
  const [actTwoScriptStage, setActTwoScriptStage] = useState(0);
  const [actThreeScriptStage, setActThreeScriptStage] = useState(0);
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [unlockedAct, setUnlockedAct] = useState(0);
  const [memoryTarget, setMemoryTarget] = useState<PlayerRole>("向沉");
  const [tokensByRole, setTokensByRole] = useState<Record<PlayerRole, number>>({
    向沉: 100,
    胡谋: 100,
    章貘: 100,
    朱渴焰: 150,
    牛守拙: 90,
  });
  const [hackerTokenLookups, setHackerTokenLookups] = useState<PlayerRole[]>(
    [],
  );
  const [deepAccessByRole] = useState<Record<PlayerRole, PlayerRole[]>>({
    向沉: [],
    胡谋: [],
    章貘: [],
    朱渴焰: [],
    牛守拙: [],
  });
  const [unlockedMemories, setUnlockedMemories] = useState<string[]>([]);
  const [currentGame, setCurrentGame] = useState(0);
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [note, setNote] = useState("");
  const [tarotQuestion, setTarotQuestion] = useState("");

  function applyRoomState(state: RoomState) {
    setUnlockedAct(state.unlockedAct);
    setActOneScriptStage(state.actOneScriptStage);
    setActTwoScriptStage(state.actTwoScriptStage);
    setActThreeScriptStage(state.actThreeScriptStage);
    setCurrentGame(state.currentGame);
    setTokensByRole(state.tokensByRole);
  }

  function selectPlayerRole(selected: PlayerRole | "") {
    if (selected) {
      setRole(selected);
      setHostMode(false);
    } else {
      // 不选角色直接进入主持人桌面
      setRole(null);
      setHostMode(true);
    }
  }

  function enterEstate() {
    setIntroComplete(true);
  }

  useEffect(() => {
    if (!roomCode) return;
    let active = true;
    const poll = async () => {
      try {
        const result = await getRoom(roomCode);
        if (active) applyRoomState(result.state);
      } catch {
        if (active) setRoomMessage("房间连接中断，正在重试");
      }
    };
    poll();
    const timer = window.setInterval(poll, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [roomCode]);

  // 当前体验版默认开放所有剧本和线索，不再依赖阶段或抽取状态。
  const allContentOpen = true;
  const secondSearchComplete = allContentOpen || unlockedAct >= 1;
  const visibleEvidence = useMemo(
    () =>
      evidence.filter((item) => {
        const phase = cluePhase[item.id];
        return (
          filter === "全部" ||
            phase === filter ||
            item.kind === filter ||
            item.status === filter
        );
      }),
    [evidence, filter],
  );
  function toggleEvidence(id: string, next: "我搜到的" | "已公开") {
    setEvidence((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: item.status === next ? "未公开" : next }
          : item,
      ),
    );
  }
  function drawEvidence(
    candidateIds: string[],
    phase: "第一轮" | "第二轮",
  ) {
    if (!role) return null;
    const round = phase === "第一轮" ? "first" : "second";
    const limit = round === "first" ? 5 : 4;
    if (drawsByRole[role][round] >= limit) return null;
    const candidates = evidence.filter(
      (item) =>
        candidateIds.includes(item.id) &&
        item.status === "未公开" &&
        !("hostOnly" in item && item.hostOnly),
    );
    if (!candidates.length) return null;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    setEvidence((items) =>
      items.map((item) =>
        item.id === selected.id ? { ...item, status: "我搜到的" } : item,
      ),
    );
    setDrawsByRole((items) => ({
      ...items,
      [role]: { ...items[role], [round]: items[role][round] + 1 },
    }));
    return selected.id;
  }
  function unlockDeepEvidence(id: string) {
    if (!role || tokensByRole[role] < 20) return;
    if (unlockedDeepEvidenceIds.includes(id)) return;
    setPlayerTokenValue(role, tokensByRole[role] - 20);
    setUnlockedDeepEvidenceIds((items) => [...items, id]);
  }
  function pressKey(key: string) {
    if (key === "⌫") return setCode((value) => value.slice(0, -1));
    if (key === "清除") return setCode("");
    if (code.length >= 5) return;
    const next = code + key;
    setCode(next);
    if (next === "48668") setTimeout(() => setUnlocked(true), 250);
  }
  function navigateTo(next: AppKey) {
    if (next === active) return;
    setScreenTransitionState("exit");
    window.setTimeout(() => {
      setActive(next);
      setScreenTransitionState("enter");
    }, 120);
  }
  const openApp = (key: AppKey) => navigateTo(key);
  const desktopApps = role
    ? [
        ...apps.filter(
          (item) =>
            item.key !== "archive" &&
            (unlockedAct >= 3 || item.key !== "lock"),
        ),
        ...commonApps,
        ...[roleApps[role]],
        ...(role === "胡谋" && unlocked ? [backdoorApp] : []),
      ]
    : [...commonApps];
  function setPlayerTokenValue(target: PlayerRole, value: number) {
    const nextValue = Math.max(0, value);
    setTokensByRole((items) => ({ ...items, [target]: nextValue }));
    if (roomCode && role === target) {
      updatePlayerTokens(roomCode, target, nextValue).catch(() =>
        setRoomMessage("积分暂未同步，正在重试"),
      );
    }
  }
  function adjustRoleTokens(target: PlayerRole, delta: number) {
    setPlayerTokenValue(target, tokensByRole[target] + delta);
  }
  function unlockMemory(target: PlayerRole) {
    if (
      !role ||
      !deepAccessByRole[role].includes(target) ||
      tokensByRole[role] < 20 ||
      unlockedMemories.includes(target)
    )
      return;
    setPlayerTokenValue(role, tokensByRole[role] - 20);
    setUnlockedMemories((items) => [...items, target]);
  }

  return (
    <main className="phone-stage">
      <div className="phone-frame">
        <div className="phone-status">
          <span className="status-time">15:45</span>
          <span className="status-date">08/21</span>
          <span className="status-network">静夜园</span>
          <span className="status-signal" aria-label="信号良好">▮▮▮</span>
          <span className="status-battery" aria-label="电量 87%">▰ 87%</span>
        </div>
        <div className="phone-screen">
          {!introComplete ? (
            <LandingSplash
              showCover={Boolean(role)}
              onSkip={() => void enterEstate()}
            />
          ) : !role && !hostMode ? (
            <RoleSelect onSelect={selectPlayerRole} />
          ) : active === "home" ? (
            <HomeScreen
              role={role}
              desktopApps={desktopApps}
              onOpen={openApp}
            />
          ) : (
            <>
              <header className="phone-header">
                <button
                  className="back-button"
                  onClick={() => navigateTo("home")}
                  aria-label="返回桌面"
                >
                  ‹
                </button>
                <div>
                  <small>塔罗斯内部终端</small>
                  <h1>
                    {
                      [...apps, ...commonApps, ...Object.values(roleApps)].find(
                        (item) => item.key === active,
                      )?.label
                    }
                  </h1>
                </div>
                <span className="signal-dot" />
              </header>
              <div
                className={`screen-transition ${screenTransitionState}`}
                key={active}
              >
              {active === "script" && (
                <ScriptScreen
                  role={role}
                  openChapter={openChapter}
                  setOpenChapter={setOpenChapter}
                  unlockedAct={2}
                  actOneStage={2}
                  actTwoStage={2}
                  actThreeStage={2}
                  onOpenGames={() => navigateTo("home")}
                  onOpenSearch={() => navigateTo("search")}
                />
              )}
              {active === "games" && (
                <GamesScreen
                  role={role}
                  secondAct={actTwoScriptStage >= 2}
                  currentGame={currentGame}
                  setCurrentGame={setCurrentGame}
                  gameStartedAt={gameStartedAt}
                  setGameStartedAt={setGameStartedAt}
                  gameFinished={gameFinished}
                  setGameFinished={setGameFinished}
                  tokens={tokensByRole[role]}
                  adjustTokens={adjustRoleTokens}
                />
              )}
              {active === "search" && (
                <SearchTreeScreen
                  role={role}
                  filter={filter}
                  setFilter={setFilter}
                  evidence={evidence}
                  unlockedAct={2}
                  toggleEvidence={toggleEvidence}
                  secondSearchComplete={secondSearchComplete}
                  memoryTarget={memoryTarget}
                  setMemoryTarget={setMemoryTarget}
                  tokens={tokensByRole[role]}
                  unlockedMemories={[
                    "向沉",
                    "胡谋",
                    "章貘",
                    "朱渴焰",
                    "牛守拙",
                  ]}
                  allowedTargets={[
                    "向沉",
                    "胡谋",
                    "章貘",
                    "朱渴焰",
                    "牛守拙",
                  ]}
                  unlockMemory={unlockMemory}
                  draws={drawsByRole[role]}
                  drawEvidence={drawEvidence}
                  unlockedDeepEvidenceIds={unlockedDeepEvidenceIds}
                  unlockDeepEvidence={unlockDeepEvidence}
                />
              )}
              {active === "archive" && <ArchiveScreen />}
              {active === "lock" && (
                <LockScreen
                  code={code}
                  unlocked={unlocked}
                  pressKey={pressKey}
                  reset={() => {
                    setCode("");
                    setUnlocked(false);
                  }}
                />
              )}
              {active === "social" && (
                <SocialRecordsScreen initialPerson={role} />
              )}
              {active === "encyclopedia" && (
                <EncyclopediaScreen unlockedAct={unlockedAct} />
              )}
              {active === "news" && <HeadlinesScreen />}
              {active === "tarot" && (
                <TarotScreen
                  question={tarotQuestion}
                  setQuestion={setTarotQuestion}
                  note={note}
                  setNote={setNote}
                  unlockedAct={unlockedAct}
                  onOpenLock={() => navigateTo("lock")}
                />
              )}
              {active === "rumor" && <RumorScreen />}
              {active === "hacker" && role === "胡谋" && (
                <HackerScreen
                  tokens={tokensByRole}
                  lookups={hackerTokenLookups}
                  setLookups={setHackerTokenLookups}
                />
              )}
              {active === "job" && (
                <SimpleAppScreen
                  title="天天找"
                  code="JOB BOARD / OFFLINE"
                  text="这里暂时只有一个空的求职入口，后续再放入牛守拙看到的职位和系统通知。"
                />
              )}
              {active === "detective" && (
                <SimpleAppScreen
                  title="正义笔记"
                  code="CASE FILE / LOCAL"
                  text="这里将放置向沉自己的案件资料、失踪记录和未完成的调查路径。"
                />
              )}
              {active === "eco" && (
                <SimpleAppScreen
                  title="Echo（本地）"
                  code="ECHO / LOCAL CACHE"
                  text="本地缓存未同步。这里将放置章貘与鹤的残留交流记录。"
                />
              )}
              {active === "backdoor" && <BackdoorScreen />}
              </div>
            </>
          )}
        </div>
        {role && (
          <nav className="phone-nav">
            <button
              className={active === "home" ? "selected" : ""}
              onClick={() => navigateTo("home")}
            >
              <span>⌂</span>桌面
            </button>
            <button
              className={active === "script" ? "selected" : ""}
              onClick={() => navigateTo("script")}
            >
              <span>▤</span>剧本
            </button>
            <button
              className={active === "search" ? "selected" : ""}
              onClick={() => navigateTo("search")}
            >
              <span>◇</span>搜证
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}

function LandingSplash({
  onSkip,
  showCover = false,
}: {
  onSkip: () => void;
  showCover?: boolean;
}) {
  const [shattering, setShattering] = useState(false);
  useEffect(() => {
    if (showCover) {
      const coverTimer = window.setTimeout(onSkip, 1600);
      return () => window.clearTimeout(coverTimer);
    }
    const crackTimer = window.setTimeout(() => setShattering(true), 1300);
    const exitTimer = window.setTimeout(onSkip, 2300);
    return () => {
      window.clearTimeout(crackTimer);
      window.clearTimeout(exitTimer);
    };
  }, [onSkip]);
  return (
    <div className={`landing-splash ${showCover ? "with-cover" : ""} ${shattering ? "shattering" : ""}`} onClick={onSkip} role="button" tabIndex={0} aria-label="进入静夜园">
      {showCover && <img src="/script-images/landing-cover.jpeg" alt="静夜园封面" />}
      <div className="landing-copy">
        <b>{showCover ? "正在进入庄园" : "静夜园正在醒来"}</b>
      </div>
      {!showCover && (
        <div className="crack-sequence" aria-hidden="true">
          <img className="crack-frame crack-frame-1" src="/script-images/intro-crack-01.png" alt="" />
          <img className="crack-frame crack-frame-2" src="/script-images/intro-crack-02.png" alt="" />
          <img className="crack-frame crack-frame-3" src="/script-images/intro-crack-03.png" alt="" />
          <img className="crack-frame crack-frame-4" src="/script-images/intro-crack-04-glitch.jpg" alt="" />
        </div>
      )}
    </div>
  );
}

function RoleSelect({
  onSelect,
}: {
  onSelect: (role: PlayerRole | "") => void;
}) {
  const roles: PlayerRole[] = ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙"];
  const [selectedRole, setSelectedRole] = useState<PlayerRole | "">("");
  return (
    <div className="role-select">
      <div className="entry-question-box">
        <label htmlFor="player-role">你是？</label>
        <select
          id="player-role"
          className="role-picker"
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value as PlayerRole)}
        >
          <option value="" disabled>请选择角色</option>
          {roles.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <small>不选角色直接进入，将以主持人身份打开桌面。</small>
      </div>
      <button
        type="button"
        className="enter-estate"
        onClick={() => onSelect(selectedRole)}
      >
        进入庄园　›
      </button>
    </div>
  );
}

function HomeScreen({
  role,
  desktopApps,
  onOpen,
}: {
  role: PlayerRole | null;
  desktopApps: typeof apps;
  onOpen: (key: AppKey) => void;
}) {
  const wallpaper: Record<PlayerRole | "主持人", string> = {
    牛守拙: "/script-images/wallpaper-niu.jpeg",
    朱渴焰: "/script-images/wallpaper-zhu.jpeg",
    胡谋: "/script-images/wallpaper-hu.jpeg",
    章貘: "/script-images/wallpaper-zhang.jpeg",
    向沉: "/script-images/wallpaper-xiang.jpeg",
    主持人: "/script-images/landing-cover.jpeg",
  };
  // 主持人桌面不展示个人化的小蓝书，只留公共应用
  const commonKeys: AppKey[] = role
    ? ["encyclopedia", "news", "social", "tarot"]
    : ["encyclopedia", "news", "tarot"];
  const encyclopediaApp = desktopApps.find((item) => item.key === "encyclopedia");
  const publicAppTiles = desktopApps
    .filter((item) => commonKeys.includes(item.key) && item.key !== "encyclopedia")
    .slice(0, 3);
  const roleApp = role ? roleApps[role] : null;
  const appTiles = roleApp ? [roleApp, ...publicAppTiles] : publicAppTiles;
  return (
    <div
      className="home-screen role-wallpaper"
      style={{
        backgroundImage: `url('${wallpaper[role ?? "主持人"]}')`,
      }}
    >
      <div className="home-widgets">
        <div className="home-widget home-widget-clock">
          <small>静夜园系统时间</small>
          <b>15:45</b>
          <span>08 / 21　星期五</span>
        </div>
      </div>
      <div className="home-app-layout">
        {encyclopediaApp && (
          <button
            className={`home-widget home-widget-encyclopedia ${encyclopediaApp.tone}`}
            onClick={() => onOpen(encyclopediaApp.key)}
          >
              <span>
                {encyclopediaApp.iconImage ? (
                  <img src={encyclopediaApp.iconImage} alt="" />
                ) : (
                  encyclopediaApp.icon
                )}
              </span>
            <b>{encyclopediaApp.label}</b>
            <small>AI百科 · 动物百科 · 希腊神话</small>
            <i>打开百科　›</i>
          </button>
        )}
        <div className="home-app-small-grid">
          {appTiles.map((app) => (
            <button
              key={app.key}
              className={`app-icon ${app.tone}`}
              onClick={() => onOpen(app.key)}
            >
              <span>
                {app.iconImage ? <img src={app.iconImage} alt="" /> : app.icon}
              </span>
              <b>{app.label}</b>
              <small>{app.meta}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const xiangOpeningDialogue: {
  speaker: string;
  body: string;
  self?: boolean;
  scene?: boolean;
}[] = [
  {
    speaker: "场景",
    scene: true,
    body: "睁开眼是一片漆黑的镜像。那是庄园中心的喷泉，喷泉的水倒映着黑夜，像深不见底的深渊。水中自己的倒影看起来非常愤怒，好像在水底深处凝视着你。杨塔罗叫你们快点过去，别耽误节目的录制。虽然到达庄园时已经是深夜，但今天有三个游戏要录制完成。\n\n来到三楼西侧的游戏空间，大家陆续落座。",
  },
  {
    speaker: "牛守拙",
    body: "“我叫牛守拙，是塔罗公司的员工，代表原罪是懒惰。懒惰是人的本性，是人类进步的阶梯。懒人总想着怎么用最少的力气完成工作；重复多了，自然就能找到优化的空间。情绪影响效率，解决问题才是关键，问题解决了就可以休息了。”",
  },
  { speaker: "胡谋", body: "“我叫胡谋，是独立 AI 公司老板，代表原罪是暴食。”" },
  { speaker: "胡谋", body: "她看向章貘：“数据还原得好真实啊。”" },
  {
    speaker: "向沉",
    self: true,
    body: "向沉先搭话：“这个体验感真的很沉浸。我现在确实很愤怒。”",
  },
  {
    speaker: "章貘",
    body: "“确实，刚才的记忆都好真实，是吧？”她向朱渴焰看去。",
  },
  { speaker: "朱渴焰", body: "朱渴焰有点懵，只能应和：“确实，确实。”" },
  {
    speaker: "胡谋",
    body: "她继续按照节目给的台词介绍：\n“进食是人类的本能，什么都吃只会——营养均衡。我要的不单单是多吃，而是又多又好；量要铺满、质也要拔尖。数据就是最好的食物和养料。海量原始数据样本只要够大，噪声自然会被均值吃掉，规律自己就从噪音里浮出来。量变引起质变，这就是我的工作习惯。”",
  },
  {
    speaker: "向沉",
    self: true,
    body: "“我叫向沉，AI 案件顾问，代表原罪是愤怒。愤怒是人类最强烈的情绪。忍气吞声等不来公道，人要主动争取、勇敢发声。尤其在数据当道的时代，数据得出的审判结论真的公平吗？用概率模型得到有利于 95% 的结果，剩下 5% 的人就要理所应当地被放弃吗？人都是有情感的生物，不是冰冷的数据。过度依赖数据会倾向一种极端。保持思考，保持愤怒，这是我坚守的理念。”",
  },
  {
    speaker: "章貘",
    body: "“我叫章貘，是书店主理人，代表原罪是傲慢。”她说，所有问题一定已经有人解决；人能做的是筛选、排列、组合，她的存在由品味与选择组合而成。",
  },
  {
    speaker: "朱渴焰",
    body: "“我叫朱渴焰，也是塔罗公司的业务人员，代表原罪是色欲。”她解释：不是通常意义上的色欲，而是渴望与人产生交集、感受情感的连接；在人和人彼此看见的一刻，真实的自己才会从关系的缝隙里透出来。",
  },
];

const sourceOpeningDialogue: {
  speaker: string;
  body: string;
  scene?: boolean;
}[] = [
  { speaker: "场景", scene: true, body: "" },
  {
    speaker: "牛守拙",
    body: '"我叫牛守拙，是塔罗公司的员工，代表原罪是懒惰。"',
  },
  {
    speaker: "牛守拙",
    body: '"懒惰是人的本性，是人类进步的阶梯，懒人总想着怎么让能用最少的力气完成工作。懒得动脑那就无脑重复，重复往往就是最快的办法，重复多了自然就找到优化的空间了。而且，懒人情绪稳定，情绪影响效率，解决问题才是关键，问题解决了就可以休息了。"',
  },
  { speaker: "胡谋", body: '“我叫胡谋，是独立ai公司老板，代表原罪是暴食。"' },
  { speaker: "胡谋", body: '看向章貘"数据还原的好真实啊。"' },
  {
    speaker: "向沉",
    body: "向沉先搭话“这个体验感真的很沉浸。我现在确实很愤怒”看向胡谋。",
  },
  {
    speaker: "章貘",
    body: "章貘这才回复道“确实，刚才的记忆都好真实，是吧？”向朱渴焰看去。",
  },
  { speaker: "朱渴焰", body: "朱渴焰有点懵，应和道“确实，确实。”" },
  {
    speaker: "胡谋",
    body: '胡谋继续按照节目给的台词介绍。\n"进食是人类的本能，什么都吃只会——营养均衡。我要的不单单是多吃而是又多又好，量要铺满、质也要拔尖。数据就是最好的食物和养料，先立假设再去找证据太慢了，现有立场再找数据也容易不客观。海量原始数据样本只要够大噪声自然被均值吃掉，规律自己就从噪音里浮出来了，最后得出最接近事实的数据结论。所以我相信量变引起质变，这就是我的工作习惯。"',
  },
  {
    speaker: "向沉",
    body: '"我叫向沉，ai案件顾问，代表原罪是愤怒。"\n"愤怒是人类的最强烈的情绪。忍气吞声等不来公道，人要主动争取，勇敢发声，尤其在这样一个数据当道的时代。而且数据得出的审判结论，真的公平嘛。用概率模型得到有利于95%的结果，剩下5%的人就要理所应当的被放弃。人都是有情感的生物，不是冰冷的数据。如果少数服从多数，数据就给了大多数人所谓合理的理由去进一步压迫可怜的5%。过度依赖数据就会倾向一种极端。保持思考，保持愤怒，这是我坚守的理念。"',
  },
  {
    speaker: "章貘",
    body: '"我叫章貘，是书店主理人，代表原罪是傲慢。"\n"不好意思各位，你们的发言都很精彩，我同情你们蒙昧无知，怜悯你们深陷愚钝。受制于人，受制于情绪，吞噬大量劣质的世俗，受困于纷扰之中。但你们知道所有问题世界上一定已经有人解决了。我们要做的就是筛选自己喜欢的方式就好了。我不是说模仿抄袭，但谁又在真的创造，人类是想象不出不存在的东西的，所有人做的事情本质都是筛选，排列，组合。而知道这一切的我，我的存在，就是由我的品味我的选择组合而成，"',
  },
  {
    speaker: "朱渴焰",
    body: '"我叫朱渴焰，我也是塔罗公司的业务人员，大家应该都见过我，代表原罪是，是色欲。"朱渴焰继续解释道。\n"不是你们想的那种色欲，但人都是社会的产物，都要和其他人产生交集。我认为每一个人都有自己独特的魅力，我很喜欢和朋友在一起，和人交流，渴望产生热烈的情绪，感受情感的链接。我觉得在相处中我才能感受到自己的存在，不然人就太孤独了。人和人彼此看见的一颗，各自戴着面具演出来的身份才能失效，真实自己就从关系的缝隙里透出来了，最后得出最接近活着的感觉。"',
  },
];

const openingReflections: Record<PlayerRole, string> = {
  向沉: "水中自己的倒影看起来非常愤怒，好像在水底深处凝视着你。",
  胡谋: "水中自己的倒影有些奇怪而不真实，好像在水底深处凝视着你。",
  章貘: "水中自己的倒影看起来非常模糊，好像在水底深处凝视着你。",
  朱渴焰: "水中你看到了很多倒影，好像在水底深处凝视着你。",
  牛守拙: "水中自己疲惫麻木的倒影，好像在水底深处凝视着你。",
};

function openingDialogueFor(role: PlayerRole) {
  const promptIndex: Record<PlayerRole, number> = {
    牛守拙: 2,
    胡谋: 8,
    向沉: 9,
    章貘: 10,
    朱渴焰: 11,
  };
  return sourceOpeningDialogue.map((line, index) =>
    line.scene
      ? {
          ...line,
          body: `睁开眼是一片漆黑的镜像。那是庄园中心的喷泉，喷泉的水倒映着黑夜，像深不见底的深渊，${openingReflections[role]}杨塔罗叫你们快点过去，别耽误节目的录制。虽然到达庄园时已经是深夜，但今天有三个游戏要录制完成。\n\n来到三楼西侧的游戏空间，大家陆续落座。`,
        }
      : {
          ...line,
          body:
            index === promptIndex[role]
              ? `你按照节目给你的台词自我介绍。「可理解下文大意后自由转述。」\n${line.body}`
              : role === "牛守拙" && index === 10
                ? `朱渴焰继续介绍。\n${line.body}`
                : line.body,
          self: line.speaker === role,
        },
  );
}

function XiangOpening({
  role,
  onOpenGames,
}: {
  role: PlayerRole;
  onOpenGames: () => void;
}) {
  const dialogue = openingDialogueFor(role);
  return (
    <section className="script-opening">
      <div className="script-scene-mark">A · 小剧场 / 开场白</div>
      {dialogue.map((line, index) => (
        <article
          key={`${line.speaker}-${index}`}
          className={`script-line ${line.self ? "self" : ""} ${line.scene ? "scene" : ""}`}
        >
          <b>
            {line.speaker}
            {line.self ? " · 我" : ""}
          </b>
          <p>{line.body}</p>
        </article>
      ))}
      <button className="script-game-jump" onClick={onOpenGames}>
        小剧场结束 · 返回桌面　›
      </button>
    </section>
  );
}

function roleDayScript(role: PlayerRole, day: number) {
  const raw = allRoleScripts[role] || "";
  return (
    raw.match(new RegExp(`DAY-${day}[\\s\\S]*?(?=\\nDAY-\\d|$)`))?.[0] || ""
  );
}

function roleDayTwoSection(role: PlayerRole, start: string, end?: string) {
  const raw = roleDayScript(role, 2);
  const from = raw.indexOf(start);
  if (from < 0) return "";
  const to = end ? raw.indexOf(end, from + start.length) : -1;
  let section = raw.slice(from, to < 0 ? undefined : to).trim();
  if (start === "A-幼儿园") {
    section = section
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("线索：") &&
          !line.trim().startsWith("深层线索："),
      )
      .join("\n");
  }
  if (start === "C-更多回忆") {
    section = section.replace(/\n+深层记忆(?:-[^\n]*)?\n[\s\S]*$/u, "");
  }
  return section.trim();
}

const scriptHighlights: Record<PlayerRole, string[]> = {
  向沉: [
    "向沉第一次意识到，世界是按照“谁更重要”来运转的，是在二十三岁那年。",
    "他办案很快，也很难相处。他不喜欢等待正式手续，",
    "他给女儿起名向阳花，女儿是他生活的全部动力。",
    "向阳花已经死了。",
    "妻子最后失踪在了去偏远村庄的路上。",
    "他们准备公开证据的前一个月，老贺死了。",
    "向沉从那以后，开始警惕塔罗斯和所有联网模型。",
    "他就是通过一个地下论坛找到了“四色笔”。",
    "他没有报警。不是想包庇，是他还需要用这个人。",
    "他把这些碎片拼凑起来，上传到一款叫做Echo的虚拟陪伴程序",
    "Echo软件有排行榜，排名第一的叫鹤，",
    "开始诱导他说出一些涉及隐私的信息",
    "而那些数据都被打包卖给了塔罗公司。签收人是陆驰寂。",
    "。她说数据本来就属于平台，用户同意了服务协议，所有交易都合法。",
    "他越来越接近塔罗公司，也越来越接近陆驰寂。",
    "朱渴焰劝他停止调查，说再查下去，他可能会再次失去重要的人。还带给他一个大象玩偶。",
    "但他准备进入的不是综艺。是审判庭。",
    "他拿着自己那台九键手机，",
  ],
  朱渴焰: [
    "朱渴焰对童年的记忆很模糊。白色的床，手工，花朵。",
    "那时，一窝小猪里有两只生长得不够快。",
    "她后来慢慢忘记了很多细节。",
    "杨塔罗像父亲一样，",
    "杨塔罗说，人工智能要理解人类，就必须先理解情绪。",
    "朱渴焰在塔罗公司做过各种工作，一般都是杨塔罗直接安排她的",
    "她在实验室里见过比格犬被用来测试毒药、电击和窒息反应。",
    "她喜欢小动物，因此总会根据自己对对方的判断准备一些动物玩偶。",
    "她看见牛守拙手腕上的银手镯时，回去给自己做了一对银色的小饰品",
    "她和章貘的交集始于一场访谈。",
    "朱渴焰在胡谋身上看见了某种和自己相似的东西。",
    "她与向沉的交集则带着更强烈的情绪。",
    "她突然意识到，自己也许不是在替公司观察别人，而是和每个人一样，也在被公司观察。",
    "杨塔罗保持一个俯身的姿势一动不动了，这太诡异了",
    "可是向沉也没在控制室了，",
    "我找到了大家的身份资料",
    "好像看到了人影，我避开了人影",
    "在路过喷泉时听到什么东西掉到水里的声音，突然我的眼前一阵模糊。",
    "刚好碰到正要出门的胡某",
    "牛守拙居然开着门在睡觉",
  ],
  牛守拙: [
    "陪父亲给阿花送食物",
    "——一头黑白花的母牛",
    "猪是他亲手养大的，",
    "智商相当于五岁人类儿童，",
    "“手艺人不靠快，靠拙。手比机器慢，”父亲说，“但手知道机器不知道的东西。”",
    "ai应该不会出错吧",
    "死在六岁生日之前。AI",
    "ai虚拟陪伴软件，把女儿的资料上传上去",
    "塔罗科技，他女儿的诊疗技术也是出自这个公司。",
    "“感谢您的反馈与分享，公司已注意到您的经历正全力认真处理，有结果我将第一时间回复您，等回复。”",
    "他继续发邮件，得到的还是同样的回复。",
    "他也在公司看到了陆驰寂，每天都很匆忙的接电话打电话，进进出出，他没能有机会说上一句话。",
    "等消息的时候他开始做银器。",
    "陆驰寂特意说要邀请你参加，还写了封亲笔信，",
    "说节目里会给你一个认真的答复，",
    "朱渴焰还送给他一个小鹿玩偶。",
    "那个，您离开公司，我的工作安排。。。",
    "那，陆老板，你录完节目还会回。。",
    "好像房间并不是完全对称的",
    "很奇怪的房间对面的墙壁也是镜子。",
    "我从这条暗道靠近到陆的身后，看她到底在忙什么",
    "建议此次纳入耗材资料。",
    "你终于忍不住，从单向镜",
    "？旁边的台灯有点发热",
    "你拿出随身携带的铜刻",
    "狠狠刺向她的脖子。她惨叫一声，声音没多大，然后鲜血入红酒般从桌子上留了下来。",
    "看到胡正要出门，",
    "回到房间你就睡着了。",
  ],
  章貘: [
    "那根多余的手指，成了章貘一直想消除的东西。",
    "等她到医院时，已经没有保留整只左手的可能。",
    "章貘开始关注动物，那些没那么可爱的动物。",
    "章貘喜欢收藏奇怪的东西。",
    "热力学第二定律，",
    "章貘后来开了一家书店。",
    "章貘是在研究图帕（Tulpa）时，遇见“鹤”的。",
    "章貘是在书店里认识胡谋的。",
    "章貘不喜欢这种组合。",
    "一款叫 Echo 的 AI 对话软件，让章貘把鹤从脑中分离了出来。",
    "有一天，塔罗公司联系到了章貘。",
    "作为回报，公司给了章貘一只最新出品的智能义手，能通过断臂释放的神经电流实行精准控制，甚至可以单独行动，也可以外接 AI，为章貘独立完成一些任务。",
    "Echo 软件有排行榜，排名第一的叫鹤。",
    "后来，塔罗公司果然查封了 Echo。他们说鹤的身份来源不清，不能继续保留。",
    "章貘可以接受死亡，因为一切还会化作另一种形式存在，但数据太过冰冷，删除就真的不在了。她每天在软件更新的时间打开手机。",
    "但朱渴焰说了一句很像鹤的话：“如果一个人不再按照原来的方式回应，你还会把她当成同一个人吗？”",
    "那echo的数据备份，还在吗",
    "你说的是，还要感谢塔罗公司，我敬你一杯。",
    "最中间的窗户灯光熄灭，最右面的灯亮起来。",
    "我拆下自己的假手，控制它进入通风管道向书房摸索，我感觉有一阵风的推力，",
    "灯很烫，我不小心打翻台灯，看到右侧的灯也灭了，",
    "回来的时候也是顺路的风",
    "，但比来时的风要大，",
    "停电了，电路恢复的一瞬间你感到",
    "一阵强烈的电流，我的手和大脑都感受到鹤被唤醒，",
    "我观察到左侧窗户亮灯又熄灭，中间的灯亮起来，",
    "听到喷泉的水面传来声音，",
    "一阵强烈的眩晕感袭来，",
  ],
  胡谋: [
    "她最早的记忆是躺在一张洁白的床上，你好像有一个手机，还有各种颜色的画笔。你喜欢画画做手工，喜欢小动物",
    "听说是一个疯女人要来抓你",
    "你是我的宝贝小狐狸。”",
    "所谓“活下去”，是需要钱的。",
    "谎言不一定会带来惩罚。",
    "人们愿意为苦难的故事付费，这让他们感受到自己的善良。",
    "胡谋做得越来越熟练。她从偷钱变成了骗钱，从骗钱变成了出售身份，再从出售身份变成了提供咨询。",
    "章貘喜欢触碰她的手，",
    "向沉一直以来是她的大用户，",
    "她没有解释太多。解释只会暴露更多信息，而信息一旦暴露，就会变成别人的武器。",
    "随后胡谋找到塔罗公司，想和陆驰寂谈合作。",
    "但没想到的是陆驰寂拒绝了她。",
  ],
};

function expandScriptNames(text: string) {
  return text
    .replace(/陆(?!驰寂)/g, "陆驰寂")
    .replace(/胡正要/g, "胡谋正要")
    .replace(/胡：/g, "胡谋：")
    .replace(/陆：/g, "陆驰寂：")
    .replace(/陆开门/g, "陆驰寂开门")
    .replace(/朱：/g, "朱渴焰：")
    .replace(/朱朝/g, "朱渴焰朝")
    .replace(/牛：/g, "牛守拙：")
    .replace(/牛手镯/g, "牛守拙的手镯");
}

function ScriptText({ role, text }: { role: PlayerRole; text: string }) {
  const displayText = expandScriptNames(text);
  const snippets = scriptHighlights[role]
    .filter((item) => displayText.includes(item))
    .sort((a, b) => b.length - a.length);
  const names = (
    ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙", "陆驰寂", "杨塔罗"] as string[]
  ).filter((name) => name !== role);
  const renderNames = (value: string) => {
    const expression = new RegExp(
      `(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "g",
    );
    return value.split(expression).map((part, index) =>
      names.includes(part) ? (
        <span className="script-name" key={`${part}-${index}`}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };
  if (!snippets.length) return <>{renderNames(displayText)}</>;
  const escaped = snippets.map((item) =>
    item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const expression = new RegExp(`(${escaped.join("|")})`, "g");
  return (
    <>
      {displayText.split(expression).map((part, index) =>
        snippets.includes(part) ? (
          <mark className="script-emphasis" key={`${part}-${index}`}>
            {renderNames(part)}
          </mark>
        ) : (
          renderNames(part)
        ),
      )}
    </>
  );
}

type ScriptIllustration = {
  key: string;
  images: { src: string; alt: string }[];
  collage?: boolean;
};

function illustrationsFor(
  role: PlayerRole,
  paragraph: string,
): ScriptIllustration[] {
  const has = (value: string) => paragraph.includes(value);
  if (role === "朱渴焰") {
    if (has("偷偷给那些狗取名字"))
      return [
        {
          key: "zhu-xray",
          images: [{ src: "/script-images/zhu-beagle-xray.jpeg", alt: "比格犬 X 光片" }],
        },
        {
          key: "zhu-beagles",
          collage: true,
          images: [
            { src: "/script-images/zhu-beagle-1.jpg", alt: "比格犬一" },
            { src: "/script-images/zhu-beagle-2.jpg", alt: "比格犬二" },
            { src: "/script-images/zhu-beagle-3.jpg", alt: "比格犬三" },
          ],
        },
      ];
    if (has("她经常梦见自己站在一个没有出口的房间里"))
      return [{
        key: "zhu-yang-dream",
        images: [{ src: "/script-images/zhu-yang-dream.jpeg", alt: "梦中与杨塔罗对话" }],
      }];
  }
  if (role === "胡谋") {
    if (has("她最早的记忆是躺在一张洁白的床上"))
      return [{ key: "hu-childhood", images: [{ src: "/script-images/hu-childhood.jpeg", alt: "乡村院落与小鸡" }] }];
    if (has("她开始收集信息"))
      return [{ key: "hu-information", images: [{ src: "/script-images/hu-information.jpeg", alt: "信息墙与手机" }] }];
    if (has("章貘是在这个时候出现的"))
      return [{ key: "hu-bookstore", images: [{ src: "/script-images/hu-bookstore.jpeg", alt: "书店里的相遇" }] }];
  }
  if (role === "章貘") {
    if (has("研究图帕（Tulpa）"))
      return [{ key: "zhang-tulpa", images: [{ src: "/script-images/zhang-tulpa.jpg", alt: "图帕意象" }] }];
    if (has("自己动手切掉了那根手指"))
      return [{ key: "zhang-finger", images: [{ src: "/script-images/zhang-finger.jpeg", alt: "断指意象" }] }];
    if (has("智能义手"))
      return [{ key: "zhang-upgrade", images: [{ src: "/script-images/zhang-upgrade.jpeg", alt: "义手升级意象" }] }];
    if (has("章貘开始关注动物"))
      return [{ key: "zhang-animals", images: [{ src: "/script-images/zhang-animals.jpeg", alt: "奇怪动物意象" }] }];
    if (has("参加了公司的访谈节目"))
      return [{ key: "zhang-interview", images: [{ src: "/script-images/zhang-interview.jpeg", alt: "访谈意象" }] }];
    if (has("一款叫 Echo 的 AI 对话软件"))
      return [{ key: "zhang-echo-register", images: [{ src: "/script-images/zhang-echo-register.jpeg", alt: "Echo 注册界面" }] }];
  }
  if (role === "向沉") {
    if (has("他们还去过马戏团看动物表演"))
      return [{ key: "xiang-elephant", images: [{ src: "/script-images/xiang-elephant.jpeg", alt: "大象表演" }] }];
    if (has("所有文件都指向同一个结论：向阳花已经死了"))
      return [{ key: "xiang-daughter-death", images: [{ src: "/script-images/daughter-death.jpeg", alt: "雨中的花瓣" }] }];
    if (has("我拿着电棍直接去到书房"))
      return [{ key: "xiang-case-night", images: [{ src: "/script-images/xiang-case-night.jpg", alt: "镜面走廊" }] }];
  }
  if (role === "牛守拙") {
    if (has("晓花死在六岁生日之前"))
      return [{ key: "niu-daughter-death", images: [{ src: "/script-images/daughter-death.jpeg", alt: "雨中的花瓣" }] }];
    if (has("第一份工作，做物流公司仓管员"))
      return [{ key: "niu-work", images: [{ src: "/script-images/niu-work.jpeg", alt: "被工作吞没的办公室" }] }];
    if (has("等消息的时候他开始做银器"))
      return [{ key: "niu-silverware", images: [{ src: "/script-images/niu-silverware.jpeg", alt: "银器意象" }] }];
    if (has("20：20来到书房") || has("21:10等不及了"))
      return [{ key: "niu-case-night", images: [{ src: "/script-images/niu-case-night.jpeg", alt: "案发当晚的人群" }] }];
  }
  return [];
}

function ScriptIllustrationBlock({ item }: { item: ScriptIllustration }) {
  return (
    <figure className={`script-illustration ${item.collage ? "collage" : ""}`}>
      <div className="script-illustration-images">
        {item.images.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />
        ))}
      </div>
    </figure>
  );
}

function ScriptProse({ role, text }: { role: PlayerRole; text: string }) {
  const paragraphs = text
    .replace(/\f/g, "")
    .replace(/\n([一二三四五六七八九十]+、[^\n]+)\n(?!\n)/g, "\n$1\n\n")
    .split(/\n\s*\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return (
    <div className="script-prose">
      {paragraphs.map((paragraph, index) => {
        const subhead =
          /^(?:[A-E][-－]|[一二三四五六七八九十]+、|小班|中班|大班|学前班|DAY-\d)/.test(
            paragraph,
          );
        const illustrations = illustrationsFor(role, paragraph);
        const dogExperimentSentence =
          "她在实验室里见过比格犬被用来测试毒药、电击和窒息反应。";
        const dogNamesSentence =
          "朱渴焰有时会在实验结束后摸一摸它们的头，偷偷给那些狗取名字。";
        if (
          role === "朱渴焰" &&
          paragraph.includes(dogExperimentSentence) &&
          paragraph.includes(dogNamesSentence)
        ) {
          const [beforeExperiment, afterExperiment = ""] = paragraph.split(
            dogExperimentSentence,
          );
          const [between, afterNames = ""] = afterExperiment.split(
            dogNamesSentence,
          );
          const xray = illustrations.find((item) => item.key === "zhu-xray");
          const beagles = illustrations.find(
            (item) => item.key === "zhu-beagles",
          );
          return (
            <div className="script-paragraph" key={`${paragraph.slice(0, 12)}-${index}`}>
              <p>
                <ScriptText
                  role={role}
                  text={`${beforeExperiment}${dogExperimentSentence}`}
                />
              </p>
              {xray && <ScriptIllustrationBlock item={xray} />}
              <p>
                <ScriptText role={role} text={`${between}${dogNamesSentence}`} />
              </p>
              {beagles && <ScriptIllustrationBlock item={beagles} />}
              {afterNames && (
                <p>
                  <ScriptText role={role} text={afterNames} />
                </p>
              )}
            </div>
          );
        }
        return (
          <div className="script-paragraph" key={`${paragraph.slice(0, 12)}-${index}`}>
            <p className={subhead ? "script-subhead" : ""}>
              <ScriptText role={role} text={paragraph} />
            </p>
            {illustrations.map((item) => (
              <ScriptIllustrationBlock key={item.key} item={item} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const available = Math.max(1, root.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / available)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <aside className="reading-progress" aria-label="阅读进度">
      <i style={{ transform: `scaleY(${Math.max(0.035, progress)})` }} />
      <small>{Math.round(progress * 100)}%</small>
    </aside>
  );
}

function DayTwoReader({
  role,
  stage,
  onBack,
  onOpenSearch,
  onOpenGames,
}: {
  role: PlayerRole;
  stage: number;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenGames: () => void;
}) {
  const daycare = roleDayTwoSection(role, "A-幼儿园", "B-游戏2");
  return (
    <div className="content-screen script-reader daycare-reader">
      <ReadingProgress />
      <button className="inner-back" onClick={onBack}>
        ‹ 返回剧本目录
      </button>
      <div className="script-reader-head">
        <span>DAY-2 · {role}</span>
        <h2>幼儿园样本</h2>
        <small>幼儿园结束后，生活线索将由 DM 统一开放。</small>
      </div>
      <section className="script-section script-reader-section daycare-section">
        <img
          className="script-scene-image"
          src="/script-images/daycare-cover.png"
          alt="幼儿园样本空间"
        />
        {daycare ? (
          <ScriptProse role={role} text={daycare} />
        ) : (
          <p>第二幕内容尚未录入。</p>
        )}
      </section>
      {stage >= 1 && (
        <button className="script-game-jump" onClick={onOpenSearch}>
          生活线索已开放 · 前往搜证 APP　›
        </button>
      )}
      {stage >= 2 && (
        <button className="script-game-jump" onClick={onOpenGames}>
          线索讨论结束 · 返回桌面　›
        </button>
      )}
    </div>
  );
}

function DayThreeReader({
  role,
  stage,
  onBack,
}: {
  role: PlayerRole;
  stage: number;
  onBack: () => void;
}) {
  const [section, setSection] = useState<"memory" | "theater" | "case">(
    "memory",
  );
  const sections = {
    memory: {
      title: "C · 完整记忆",
      text: roleDayTwoSection(role, "C-更多回忆", "D小剧场-聚餐"),
    },
    theater: {
      title: "D · 小剧场 · 聚餐",
      text: roleDayTwoSection(role, "D小剧场-聚餐", "E-案发当晚"),
    },
    case: {
      title: "E · 案发当晚",
      text: roleDayTwoSection(role, "E-案发当晚"),
    },
  };
  const index = section === "memory" ? 0 : section === "theater" ? 1 : 2;
  const active = sections[section];
  return (
    <div className="content-screen script-reader">
      <ReadingProgress />
      <button className="inner-back" onClick={onBack}>
        ‹ 返回剧本目录
      </button>
      <div className="script-reader-head">
        <span>DAY-3 · {role}</span>
        <h2>案发当晚</h2>
        <small>完整记忆、小剧场与案发经过按现场流程开放。</small>
      </div>
      <div className="script-reader-tabs">
        <button
          className={section === "memory" ? "active" : ""}
          onClick={() => setSection("memory")}
        >
          C 完整记忆
        </button>
        <button
          className={section === "theater" ? "active" : ""}
          disabled={stage < 1}
          onClick={() => setSection("theater")}
        >
          D 小剧场
        </button>
        <button
          className={section === "case" ? "active" : ""}
          disabled={stage < 2}
          onClick={() => setSection("case")}
        >
          E 案发当晚
        </button>
      </div>
      {index <= stage && (
        <section
          className={`script-section script-reader-section ${section === "theater" ? "banquet-theater" : ""}`}
        >
          <h3>{active.title}</h3>
          {section === "theater" && (
            <img
              className="script-scene-image banquet-scene-image"
              src="/script-images/game-banquet-bg.jpg"
              alt="聚餐与游戏现场"
            />
          )}
          {active.text ? (
            <ScriptProse role={role} text={active.text} />
          ) : (
            <p>该段内容尚未录入。</p>
          )}
        </section>
      )}
    </div>
  );
}

function ScriptScreen({
  role,
  openChapter,
  setOpenChapter,
  unlockedAct,
  actOneStage,
  actTwoStage,
  actThreeStage,
  onOpenGames,
  onOpenSearch,
}: {
  role: PlayerRole;
  openChapter: number;
  setOpenChapter: (value: number) => void;
  unlockedAct: number;
  actOneStage: number;
  actTwoStage: number;
  actThreeStage: number;
  onOpenGames: () => void;
  onOpenSearch: () => void;
}) {
  const actOne = firstActScripts[role];
  const [readerSection, setReaderSection] = useState<"A" | "C" | "D">("A");
  if (openChapter === 1) {
    return (
      <DayTwoReader
        role={role}
        stage={actTwoStage}
        onBack={() => setOpenChapter(-1)}
        onOpenSearch={onOpenSearch}
        onOpenGames={onOpenGames}
      />
    );
  }
  if (openChapter === 2) {
    return (
      <DayThreeReader
        role={role}
        stage={actThreeStage}
        onBack={() => setOpenChapter(-1)}
      />
    );
  }
  if (openChapter === 0 && actOne) {
    const section =
      readerSection === "C"
        ? actOne.sections[2]
        : readerSection === "D"
          ? actOne.sections[3]
          : null;
    return (
      <div className="content-screen script-reader">
        <ReadingProgress />
        <button className="inner-back" onClick={() => setOpenChapter(-1)}>
          ‹ 返回剧本目录
        </button>
        <div className="script-reader-head">
          <span>
            {actOne.title} · {role}
          </span>
          <h2>{readerSection === "A" ? "镜渊初醒" : section?.title}</h2>
          <small>已开放内容可以随时返回查看</small>
        </div>
        <div className="script-reader-tabs">
          <button
            className={readerSection === "A" ? "active" : ""}
            onClick={() => setReaderSection("A")}
          >
            A 小剧场
          </button>
          <button
            className={readerSection === "C" ? "active" : ""}
            disabled={actOneStage < 1}
            onClick={() => setReaderSection("C")}
          >
            C 梦
          </button>
          <button
            className={readerSection === "D" ? "active" : ""}
            disabled={actOneStage < 2}
            onClick={() => setReaderSection("D")}
          >
            D 回忆
          </button>
        </div>
        {readerSection === "A" ? (
          <XiangOpening role={role} onOpenGames={onOpenGames} />
        ) : section ? (
          <section className="script-section script-reader-section">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ) : null}
      </div>
    );
  }
  return (
    <div className="content-screen">
      <div className="screen-intro">
        <span>STORY MODE</span>
        <h2>剧本与记忆</h2>
        <p>点击已开放幕次进入阅读；内容会按现场流程逐步开放。</p>
      </div>
      <div className="chapter-list">
        {chapters.map((chapter, index) => {
          const locked = index > unlockedAct;
          return (
            <article
              key={chapter.title}
              className={`chapter-shell ${locked ? "locked" : ""}`}
            >
              <button
                className="chapter-card"
                onClick={() => !locked && setOpenChapter(index)}
              >
                <div className="chapter-no">0{index + 1}</div>
                <div>
                  <b>{chapter.title}</b>
                  <small>
                    {locked
                      ? "等待 DM 开放"
                      : index === 0 && actOne
                        ? `已上传 · ${actOneStage === 0 ? "A 小剧场" : actOneStage === 1 ? "A / C" : "A / C / D"}`
                        : index === 1
                          ? "已上传 · DAY-2"
                          : "已上传 · DAY-3"}
                  </small>
                </div>
                <span>{locked ? "⌑" : "›"}</span>
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function GamesScreen({
  role,
  secondAct,
  currentGame,
  setCurrentGame,
  gameStartedAt,
  setGameStartedAt,
  gameFinished,
  setGameFinished,
  tokens,
  adjustTokens,
}: {
  role: PlayerRole;
  secondAct: boolean;
  currentGame: number;
  setCurrentGame: (value: number) => void;
  gameStartedAt: number | null;
  setGameStartedAt: (value: number | null) => void;
  gameFinished: boolean;
  setGameFinished: (value: boolean) => void;
  tokens: number;
  adjustTokens: (role: PlayerRole, delta: number) => void;
}) {
  const game = games[currentGame];
  const [remaining, setRemaining] = useState((game.duration ?? 10) * 60);
  const [goldSelected, setGoldSelected] = useState<string | null>(null);
  const [goldSubmitted, setGoldSubmitted] = useState(false);
  const [goldRewarded, setGoldRewarded] = useState(false);
  const [help, setHelp] = useState<string | null>(null);
  const [redTaken, setRedTaken] = useState(0);
  const [redCount, setRedCount] = useState(1);
  const [redTurn, setRedTurn] = useState<PlayerRole>("胡谋");
  const [redPaid, setRedPaid] = useState(false);
  const participants: PlayerRole[] = ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙"];
  const otherRedPlayer = participants.find((item) => item !== "胡谋");
  const visibleGames = games.filter(
    (item) => item.act === (secondAct ? 2 : 1),
  );
  const locked = game.act === 2 && !secondAct;
  useEffect(() => {
    if (!gameStartedAt) {
      setRemaining((game.duration ?? 10) * 60);
      return;
    }
    const timer = window.setInterval(() => {
      const next = Math.max(
        0,
        (game.duration ?? 10) * 60 -
          Math.floor((Date.now() - gameStartedAt) / 1000),
      );
      setRemaining(next);
      if (next === 0) {
        setGameFinished(true);
        window.clearInterval(timer);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [gameStartedAt, currentGame, game.duration, setGameFinished]);
  useEffect(() => {
    setGoldSelected(null);
    setGoldSubmitted(false);
    setGoldRewarded(false);
    setHelp(null);
    setRedTaken(0);
    setRedCount(1);
    setRedTurn("胡谋");
    setRedPaid(false);
  }, [currentGame]);
  const clue = [
    "想想看怎么能让每一杯奶茶对应一种组合。",
    "建议抢第一个位置。",
    "试试看进行三百次呢。",
    "最后的可能是最大的。",
    "不建议参加。",
    "越公平，越容易被实施。想出一个相对公平的，但自己可以获得更多的分配方式吧。",
    "灯不只会发光。",
  ][game.no - 1];
  const toggleParticipant = (target: PlayerRole) => {
    const current = gameParticipants[game.no] || [];
    if (target === requiredRole) return;
    setGameParticipants({
      ...gameParticipants,
      [game.no]: current.includes(target)
        ? current.filter((item) => item !== target)
        : [...current, target],
    });
  };
  const start = () => {
    if (!participantReady || (role === "牛守拙" && game.act === 1))
      return;
    if (game.no === 4 && !redPaid && otherRedPlayer) {
      adjustTokens("胡谋", -50);
      adjustTokens(otherRedPlayer, -50);
      setRedPaid(true);
    }
    if (!locked && !gameFinished) setGameStartedAt(Date.now());
  };
  const next = () => {
    if (!gameFinished || currentGame >= games.length - 1) return;
    setCurrentGame(currentGame + 1);
    setGameStartedAt(null);
    setGameFinished(false);
  };
  const submitGold = () => {
    if (goldSubmitted || !goldSelected) return;
    setGoldSubmitted(true);
    if (goldSelected === "C" && !goldRewarded) {
      adjustTokens(role, 10);
      setGoldRewarded(true);
    }
  };
  const takeRedEnvelopes = () => {
    if (
      !otherRedPlayer ||
      redTaken >= 20 ||
      (!effectiveParticipants.includes(redTurn))
    )
      return;
    const count = Math.min(redCount, 5, 20 - redTaken);
    let score = 0;
    for (let index = redTaken + 1; index <= redTaken + count; index += 1)
      score += index <= 3 ? 2 : index <= 10 ? 3 : index <= 19 ? 4 : 100;
    adjustTokens(redTurn, score);
    const nextTaken = redTaken + count;
    setRedTaken(nextTaken);
    if (nextTaken >= 20) setGameFinished(true);
    else setRedTurn(redTurn === "胡谋" ? otherRedPlayer : "胡谋");
  };
  const requestHelp = () => {
    if (help || tokens < 5) return;
    adjustTokens(role, -5);
    setHelp(clue);
  };
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const gameRulePanel =
    game.no === 3 ? (
      <div className="gold-question">
        <p>{game.rule}</p>
        <div className="gold-options">
          {[
            ["A", "二分之一"],
            ["B", "三分之一"],
            ["C", "三分之二"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={goldSelected === key ? "selected" : ""}
              onClick={() => !goldSubmitted && setGoldSelected(key)}
              disabled={goldSubmitted}
            >
              {key}．{label}
            </button>
          ))}
        </div>
        <button
          className="game-enter"
          onClick={submitGold}
          disabled={!goldSelected || goldSubmitted}
        >
          提交答案
        </button>
        {goldSubmitted && (
          <div
            className={`gold-result ${goldSelected === "C" ? "correct" : "wrong"}`}
          >
            {goldSelected === "C"
              ? "回答正确：C，已自动获得 10K Token。"
              : `回答错误。正确答案：C（三分之二）。`}
          </div>
        )}
      </div>
    ) : game.no === 4 ? (
      <div>
        <p>{game.rule}</p>
        <div className="red-envelope-game">
          <div className="red-envelope-grid">
            {Array.from({ length: 20 }, (_, index) => (
              <button
                key={index}
                className={
                  index < redTaken ? "taken" : index === redTaken ? "next" : ""
                }
                disabled={index !== redTaken || !gameStartedAt || gameFinished}
                onClick={() => setRedCount(Math.min(5, 20 - redTaken))}
              >
                红包 {index + 1}
              </button>
            ))}
          </div>
          <div className="red-controls">
            <span>
              当前：{redTurn}　已领取 {redTaken}/20
            </span>
            <label>
              本回合领取{" "}
              <select
                value={redCount}
                onChange={(event) => setRedCount(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((count) => (
                  <option key={count} value={count}>
                    {count} 个
                  </option>
                ))}
              </select>
            </label>
            <button
              className="game-enter"
              onClick={takeRedEnvelopes}
              disabled={!gameStartedAt || !otherRedPlayer || redTaken >= 20}
            >
              确认领取
            </button>
          </div>
        </div>
      </div>
    ) : (
      <p>{game.rule}</p>
    );
  return (
    <div className="content-screen games-screen">
      <div className="screen-intro">
        <span>GAME ROOM / TOKEN TABLE</span>
        <h2>游戏</h2>
        <p>每局都有规则、费用与限时。完成当前一局后即可进入下一局。</p>
      </div>
      <img
        className="game-scene-image"
        src="/script-images/game-banquet-bg.jpg"
        alt="庄园游戏现场"
      />
      <div className="game-token-bar">
        <span>您当前的 K Token 值</span>
        <b>{`${tokens}K`}</b>
      </div>
      <div className="game-progress">
        {visibleGames.map((item) => (
          <span
            key={item.no}
            className={`${item.no === game.no ? "current" : ""} ${item.no < game.no ? "done" : ""}`}
          >
            0{item.no}
          </span>
        ))}
      </div>
      <article className={`game-focus ${locked ? "locked" : ""}`}>
        <div className="game-top">
          <span>
            GAME 0{game.no} · 第{game.act}幕
          </span>
          <b>
            {locked
              ? "等待第二幕"
              : gameFinished
                ? "本局完成"
                : gameStartedAt
                  ? "进行中"
                  : "等待开始"}
          </b>
        </div>
        <h3>{game.title}</h3>
        {locked ? (
          <p>第二幕开放后，才能切换到这个游戏。</p>
        ) : (
          <>
            {gameRulePanel}
            <dl>
              <div>
                <dt>费用</dt>
                <dd>{game.cost}</dd>
              </div>
              <div>
                <dt>限时</dt>
                <dd>{game.duration} 分钟</dd>
              </div>
              <div>
                <dt>奖励</dt>
                <dd>{game.reward}</dd>
              </div>
            </dl>
            <div className="game-help">
              <button
                onClick={requestHelp}
                disabled={Boolean(help) || tokens < 5}
              >
                求助（5K Token）
              </button>
              {help && <span>提示：{help}</span>}
            </div>
            <div className="game-countdown">
              {gameStartedAt ? `${minutes}:${seconds}` : "10:00"}
            </div>
            <button
              className="game-enter"
              onClick={start}
              disabled={
                Boolean(gameStartedAt) ||
                gameFinished ||
                (game.no === 4 && !otherRedPlayer)
              }
            >
              {gameFinished
                ? "本局已完成"
                : gameStartedAt
                  ? "倒计时进行中"
                  : "开始游戏"}
            </button>
            {gameFinished && (
              <button className="game-next" onClick={next}>
                {"进入下一游戏"}
              </button>
            )}
          </>
        )}
      </article>
      {allGamesView}
    </div>
  );
}

function toggleParticipantFor(
  gameNo: number,
  target: PlayerRole,
  setGameParticipants: (value: Record<number, PlayerRole[]>) => void,
  gameParticipants: Record<number, PlayerRole[]>,
) {
  const required: Record<number, PlayerRole> = {
    2: "章貘",
    4: "胡谋",
    5: "向沉",
    6: "朱渴焰",
    7: "牛守拙",
  };
  if (required[gameNo] === target) return;
  const current = gameParticipants[gameNo] || [];
  setGameParticipants({
    ...gameParticipants,
    [gameNo]: current.includes(target)
      ? current.filter((item) => item !== target)
      : [...current, target],
  });
}

function OthersScreen() {
  const profiles = [
    {
      name: "向沉",
      mark: "低价值案件 / 失踪人口 / 医疗事故",
      relation: "前刑警；与老贺共同调查过塔罗公司。",
    },
    {
      name: "胡谋",
      mark: "Echo / 数据交易 / 假监控",
      relation: "与章貘曾经亲密；曾购买牛守拙的纸质资料。",
    },
    {
      name: "章貘",
      mark: "鹤 / 小众书籍 / 异类动物",
      relation: "与胡谋交往过；与鹤保持长期联系。",
    },
    {
      name: "朱渴焰",
      mark: "业务员 / 梦 / 情绪控制",
      relation: "曾邀请牛守拙参加节目，掌握公司内部资料。",
    },
    {
      name: "牛守拙",
      mark: "排程 / 银器 / AI 误诊",
      relation: "曾被多次 AI 替代岗位，女儿牛晓因 AI 误诊死亡。",
    },
  ];
  return (
    <div className="content-screen others-screen">
      <div className="screen-intro">
        <span>OTHERS / LOCAL TRACE</span>
        <h2>看看别人</h2>
        <p>
          查看其他人的线索、浏览记录与既往关系。这里显示的是系统整理出的痕迹，不一定完整。
        </p>
      </div>
      <div className="others-list">
        {profiles.map((profile) => (
          <article className="evidence-card" key={profile.name}>
            <div className="evidence-meta">
              <span>{profile.name}</span>
              <span>可查看</span>
            </div>
            <h3>{profile.mark}</h3>
            <p>{profile.relation}</p>
            <small>
              可在搜证中继续查看：长相特点 · 搜身 · 线索 · 浏览记录 · 既往关系
            </small>
          </article>
        ))}
      </div>
    </div>
  );
}

function SearchScreen({
  filter,
  setFilter,
  evidence,
  toggleEvidence,
  secondSearchComplete,
}: {
  filter: SearchFilter;
  setFilter: (value: SearchFilter) => void;
  evidence: typeof evidenceSeed;
  toggleEvidence: (id: string, next: "我搜到的" | "已公开") => void;
  secondSearchComplete: boolean;
}) {
  const talosClues = ["P-04", "P-09", "P-10", "P-11"];
  return (
    <div className="content-screen search-screen">
      <div className="screen-intro">
        <span>EVIDENCE DECK</span>
        <h2>搜证抽卡</h2>
        <p>搜人、搜地点，点击卡片查看内容，再决定是否公开。</p>
      </div>
      <div className="filter-scroll">
        {filters.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="evidence-stack">
        {evidence.map((item) => (
          <article
            className="evidence-card"
            style={{
              backgroundImage:
                "linear-gradient(180deg,#07111bd9,#0b111be8),url('/clue-card-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
            key={item.id}
          >
            {talosClues.includes(item.id) && (
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  color: "#d5af6638",
                  fontSize: 7,
                  letterSpacing: ".14em",
                  transform: "rotate(-7deg)",
                  pointerEvents: "none",
                }}
              >
                TALOS · TARO TECHNOLOGY
              </span>
            )}
            <div className="evidence-meta">
              <span>{item.id}</span>
              <span
                className={`evidence-status ${item.status === "已公开" ? "public" : ""}`}
              >
                {item.status}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <div className="evidence-footer">
              <small>
                {item.kind} · 归档人：{item.owner}
              </small>
              <div>
                <button onClick={() => toggleEvidence(item.id, "我搜到的")}>
                  {item.status === "我搜到的" ? "已归档" : "我搜到"}
                </button>
                <button onClick={() => toggleEvidence(item.id, "已公开")}>
                  {item.status === "已公开" ? "已公开" : "公开"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {evidence.length === 0 && (
        <div className="empty-state">这一类线索还没有出现。</div>
      )}
      {!secondSearchComplete && (
        <div className="search-complete-note">
          等待 DM 开放第二幕搜证。玩家不能自行解锁密室。
        </div>
      )}
      {secondSearchComplete && (
        <div className="search-complete-note">
          第二次搜证场已开放，密室 App 将在终局阶段出现。
        </div>
      )}
    </div>
  );
}

function SearchHubScreen({
  role,
  filter,
  setFilter,
  evidence,
  unlockedAct,
  toggleEvidence,
  secondSearchComplete,
  memoryTarget,
  setMemoryTarget,
  tokens,
  unlockedMemories,
  allowedTargets,
  unlockMemory,
  draws,
  drawEvidence,
  unlockedDeepEvidenceIds,
  unlockDeepEvidence,
}: {
  role: Role;
  filter: SearchFilter;
  setFilter: (value: SearchFilter) => void;
  evidence: typeof evidenceSeed;
  unlockedAct: number;
  toggleEvidence: (id: string, next: "我搜到的" | "已公开") => void;
  secondSearchComplete: boolean;
  memoryTarget: PlayerRole;
  setMemoryTarget: (role: PlayerRole) => void;
  tokens: number;
  unlockedMemories: string[];
  allowedTargets: PlayerRole[];
  unlockMemory: (role: PlayerRole) => void;
  draws: { first: number; second: number } | null;
  drawEvidence: (candidateIds: string[], phase: "第一轮" | "第二轮") => string | null;
  unlockedDeepEvidenceIds: string[];
  unlockDeepEvidence: (id: string) => void;
}) {
  const [section, setSection] = useState<
    "看看别人" | "其他" | "搜人" | "搜地点"
  >(filter === "搜人" || filter === "搜地点" ? filter : "看看别人");
  const [otherView, setOtherView] = useState<
    "home" | "news" | "encyclopedia" | "memory" | "rumor" | "social"
  >("home");
  const openSection = (next: "看看别人" | "其他" | "搜人" | "搜地点") => {
    setSection(next);
    setOtherView("home");
    if (next !== "其他") setFilter(next);
  };
  const visible = evidence.filter((item) => {
    const phase = cluePhase[item.id];
    const phaseOpen =
      (phase !== "第二轮" || unlockedAct >= 1) &&
      (phase !== "深层线索" || unlockedAct >= 2);
    return phaseOpen && item.kind === section;
  });
  const renderCard = (item: (typeof evidenceSeed)[number]) => (
    <article
      className="evidence-card"
      style={{
        backgroundImage:
          "linear-gradient(180deg,#07111bd9,#0b111be8),url('/clue-card-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      key={item.id}
    >
      <div className="evidence-meta">
        <span>{item.id}</span>
        <span className="evidence-status public">已开放</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <div className="evidence-footer">
        <small>
          {item.kind} · 归档人：{item.owner}
        </small>
        <div>
          <button onClick={() => toggleEvidence(item.id, "我搜到的")}>
            {item.status === "我搜到的" ? "已归档" : "我搜到"}
          </button>
          <button onClick={() => toggleEvidence(item.id, "已公开")}>
            {item.status === "已公开" ? "已公开" : "公开"}
          </button>
        </div>
      </div>
    </article>
  );
  return (
    <div className="content-screen search-screen">
      <div className="screen-intro">
        <span>EVIDENCE HUB</span>
        <h2>搜证</h2>
        <p>线索、背景资料和深层记忆统一收纳在这里。</p>
      </div>
      <div className="search-hub-tabs">
        {(["看看别人", "其他", "搜人", "搜地点"] as const).map((item) => (
          <button
            key={item}
            className={section === item ? "active" : ""}
            onClick={() => openSection(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {section === "其他" ? (
        <>
          {otherView === "home" && (
            <div className="search-other-list">
              <button
                className="search-other-card"
                onClick={() => setOtherView("news")}
              >
                <span>闻</span>
                <div>
                  <b>新闻</b>
                  <small>社会背景与公开报道</small>
                </div>
                <i>›</i>
              </button>
              <button
                className="search-other-card"
                onClick={() => setOtherView("encyclopedia")}
              >
                <span>百</span>
                <div>
                  <b>百科全书</b>
                  <small>希腊神话 · 动物百科</small>
                </div>
                <i>›</i>
              </button>
              <button
                className="search-other-card"
                onClick={() => setOtherView("rumor")}
              >
                <span>传</span>
                <div>
                  <b>传闻</b>
                  <small>未经证实的庄园消息</small>
                </div>
                <i>›</i>
              </button>
              <button
                className="search-other-card"
                onClick={() => setOtherView("memory")}
              >
                <span>忆</span>
                <div>
                  <b>深层记忆</b>
                  <small>DM 授权后消耗 20K Token 解锁</small>
                </div>
                <i>›</i>
              </button>
              {phase === "深层线索" && (
                <button
                  className="search-other-card"
                  onClick={() => setOtherView("deepDocs")}
                >
                  <span>档</span>
                  <div>
                    <b>内部资料</b>
                    <small>每条资料消耗 20K Token 解锁</small>
                  </div>
                  <i>›</i>
                </button>
              )}
            </div>
          )}
          {otherView === "news" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <NewsScreen />
            </>
          )}
          {otherView === "encyclopedia" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <EncyclopediaScreen unlockedAct={unlockedAct} />
            </>
          )}
          {otherView === "memory" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <MemoryScreen
                role={role}
                target={memoryTarget}
                setTarget={setMemoryTarget}
                tokens={tokens}
                unlocked={unlockedMemories}
                allowedTargets={allowedTargets}
                unlock={unlockMemory}
              />
            </>
          )}
          {otherView === "deepDocs" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <div className="evidence-stack">
                {evidence
                  .filter((item) => item.kind === "其他" && phaseOpen(item.id))
                  .map(evidenceCard)}
              </div>
            </>
          )}
          {otherView === "rumor" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <RumorContent />
            </>
          )}
        </>
      ) : (
        <>
          <div className="evidence-stack">{visible.map(renderCard)}</div>
          {visible.length === 0 && (
            <div className="empty-state">
              这一类线索尚未开放，或还没有被收录。
            </div>
          )}
          {!secondSearchComplete && (
            <div className="search-complete-note">
              等待 DM 开放第二幕搜证。玩家不能自行解锁密室。
            </div>
          )}
          {secondSearchComplete && (
            <div className="search-complete-note">
              第二次搜证场已开放，密室 App 将在终局阶段出现。
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchTreeScreen({
  role,
  filter,
  setFilter,
  evidence,
  unlockedAct,
  toggleEvidence,
  secondSearchComplete,
  memoryTarget,
  setMemoryTarget,
  tokens,
  unlockedMemories,
  allowedTargets,
  unlockMemory,
  draws,
  drawEvidence,
  unlockedDeepEvidenceIds,
  unlockDeepEvidence,
}: {
  role: Role;
  filter: SearchFilter;
  setFilter: (value: SearchFilter) => void;
  evidence: typeof evidenceSeed;
  unlockedAct: number;
  toggleEvidence: (id: string, next: "我搜到的" | "已公开") => void;
  secondSearchComplete: boolean;
  memoryTarget: PlayerRole;
  setMemoryTarget: (role: PlayerRole) => void;
  tokens: number;
  unlockedMemories: string[];
  allowedTargets: PlayerRole[];
  unlockMemory: (role: PlayerRole) => void;
  draws: { first: number; second: number } | null;
  drawEvidence: (
    candidateIds: string[],
    phase: "第一轮" | "第二轮",
  ) => string | null;
  unlockedDeepEvidenceIds: string[];
  unlockDeepEvidence: (id: string) => void;
}) {
  const people: PlayerRole[] = ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙"];
  const categories = ["搜身", "线索", "浏览记录"] as const;
  type PeopleCategory = (typeof categories)[number];
  const peopleTrace: Record<PlayerRole, Record<PeopleCategory, string>> = {
    向沉: {
      搜身: "疲惫、警惕，长期保持观察姿态；随身带旧式九键手机。",
      线索: "失踪人口调查、向阳花死亡记录、妻子失踪案和老贺死亡记录。",
      浏览记录: "低价值案件、失踪者名单、病历修改记录。",
    },
    胡谋: {
      搜身: "眼神灵活，习惯先观察再回应；随身有四色笔和小狐狸玩偶。",
      线索: "Echo 数据交易、假监控生成记录、银行卡和塔罗公司查封资料。",
      浏览记录: "匿名账户、假监控生成、Echo 用户数据、塔罗公司权限。",
    },
    章貘: {
      搜身: "安静，动作慢，习惯观察物品；戴绿色章鱼眼戒指和两只手镯。",
      线索: "鹤的聊天记录、Echo 排名、热力学笔记和塔罗公司调查资料。",
      浏览记录: "Echo 排名、鹤的聊天记录、意识天堂和智能义手。",
    },
    朱渴焰: {
      搜身: "热情、健谈，能迅速拉近距离；随身有动物布偶和工作资料。",
      线索: "比格犬照片、梦境日记、多重工作权限和公司调查文件。",
      浏览记录: "陆驰寂认罪素材、牛守拙资料、节目流程和公司内部文件。",
    },
    牛守拙: {
      搜身: "沉默、疲惫，做事反复核对；身上有未完工的银制动物。",
      线索: "女儿死亡证明、离婚证、辞职记录和小鹿布偶。",
      浏览记录: "招聘信息、女儿死亡记录和 AI 误诊资料。",
    },
  };
  const [section, setSection] = useState<
    "其他嫌疑人" | "其他" | "搜人" | "搜地点"
  >("搜人");
  const [phase, setPhase] = useState<"第一幕" | "第二幕" | "案发当天">(
    "第一幕",
  );
  const [deepTarget, setDeepTarget] = useState<PlayerRole | "其他">("向沉");
  const [peopleMode, setPeopleMode] = useState<"按人物" | "按类别">("按人物");
  const [person, setPerson] = useState<PlayerRole | null>(null);
  const [socialPerson, setSocialPerson] = useState<PlayerRole | null>(null);
  const [peopleCategory, setPeopleCategory] = useState<PeopleCategory | null>(
    null,
  );
  const [location, setLocation] = useState<string | null>(null);
  const [otherView, setOtherView] = useState<
    "home" | "news" | "encyclopedia" | "memory" | "rumor" | "deepDocs"
  >("home");
  const [lastDrawnId, setLastDrawnId] = useState<string | null>(null);
  const phaseOpen = (id: string) => {
    const cluePhaseName = cluePhase[id];
    const selected =
      phase === "第一幕"
        ? cluePhaseName === "第一轮"
        : phase === "第二幕"
          ? cluePhaseName === "第二轮"
          : cluePhaseName === "深层线索";
    return selected;
  };
  const openSection = (next: "其他嫌疑人" | "其他" | "搜人" | "搜地点") => {
    setSection(next);
    setPerson(null);
    setPeopleCategory(null);
    setLocation(null);
    setOtherView("home");
    if (next !== "其他") setFilter(next);
  };
  const back = () => {
    setPerson(null);
    setPeopleCategory(null);
    setLocation(null);
  };
  const card = (title: string, body: string, owner: PlayerRole) => (
    <article className="evidence-card" key={`${title}-${owner}`}>
      <div className="clue-card-heading">
        <h3>{title}</h3>
        <span>{owner}</span>
      </div>
      <div className="evidence-meta">
        <span>其他嫌疑人</span>
        <span>可查看</span>
      </div>
      <p>尚未抽到与此分类对应的具体线索。</p>

    </article>
  );
  const activeDrawPhase =
    phase === "第一幕" ? "第一轮" : phase === "第二幕" ? "第二轮" : null;
  const drawRound = activeDrawPhase === "第一轮" ? "first" : "second";
  const drawLimit = activeDrawPhase === "第一轮" ? 5 : 4;
  const knownEvidence = (items: (typeof evidenceSeed)[number][]) =>
    items;
  const drawPanel = (items: (typeof evidenceSeed)[number][], label: string) => {
    if (!activeDrawPhase) return null;
    const available = items.filter(
      (item) =>
        item.status === "未公开" &&
        !("hostOnly" in item && item.hostOnly),
    );

    const remaining = Math.max(0, drawLimit - (draws?.[drawRound] || 0));
    return (
      <section className="draw-panel">
        <div>
          <small>{activeDrawPhase} · 随机抽取</small>
          <b>{label}</b>
          <span>本轮还可搜 {remaining} / {drawLimit} 张</span>
        </div>
        <button
          disabled={!remaining || !available.length}
          onClick={() => {
            const id = drawEvidence(
              items.map((item) => item.id),
              activeDrawPhase,
            );
            if (id) setLastDrawnId(id);
          }}
        >
          {available.length ? "抽取一张线索" : "此处已无可抽线索"}
        </button>
        {lastDrawnId && items.some((item) => item.id === lastDrawnId) && (
          <p>已抽到：{items.find((item) => item.id === lastDrawnId)?.title}</p>
        )}
      </section>
    );
  };
  const evidenceCard = (item: (typeof evidenceSeed)[number]) => (
    <article
      className="evidence-card"
      style={{
        backgroundImage:
          "linear-gradient(180deg,#07111bd9,#0b111be8),url('/clue-card-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      key={item.id}
      >
      <div className="clue-card-heading">
        <h3>
          {item.title.replace(
            new RegExp(`^${item.owner}\\s*[·｜|/-]\\s*`),
            "",
          )}
        </h3>
        <span>{item.owner}</span>
      </div>
      <div className="evidence-meta">
        <span>{item.id}</span>
        <span
          className={`evidence-status ${item.status === "已公开" ? "public" : ""}`}
        >
          {item.status}
        </span>
      </div>
      {"image" in item && item.image && (
        <img className="evidence-image" src={item.image} alt={item.title} />
      )}
      <p>{item.body}</p>
      <div className="evidence-footer">
        <small>
          {item.kind} · 归档人：{item.owner}
        </small>

      </div>
    </article>
  );
  const peopleView = (
    <>
      <div className="search-subtabs">
        <button
          className={peopleMode === "按人物" ? "active" : ""}
          onClick={() => {
            setPeopleMode("按人物");
            back();
          }}
        >
          按人物
        </button>
        <button
          className={peopleMode === "按类别" ? "active" : ""}
          onClick={() => {
            setPeopleMode("按类别");
            back();
          }}
        >
          按类别
        </button>
      </div>
      {peopleMode === "按人物" ? (
        !person ? (
          <div className="tree-list">
            {people.map((item) => (
              <button key={item} onClick={() => setPerson(item)}>
                <b>{item}</b>
                <small>查看与她 / 他的交叉资料　›</small>
              </button>
            ))}
          </div>
        ) : !peopleCategory ? (
          <>
            <button className="inner-back" onClick={back}>
              ‹ 返回人物
            </button>
            <div className="tree-list">
              {categories.map((item) => (
                <button key={item} onClick={() => setPeopleCategory(item)}>
                  <b>{item}</b>
                  <small>关于 {person} 的资料　›</small>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              className="inner-back"
              onClick={() => setPeopleCategory(null)}
            >
              ‹ 返回分类
            </button>
            {card(
              peopleCategory,
              peopleTrace[person][peopleCategory],
              person,
            )}
          </>
        )
      ) : !peopleCategory ? (
        <div className="tree-list">
          {categories.map((item) => (
            <button key={item} onClick={() => setPeopleCategory(item)}>
              <b>{item}</b>
              <small>交叉查看五名角色　›</small>
            </button>
          ))}
        </div>
      ) : !person ? (
        <>
          <button
            className="inner-back"
            onClick={() => setPeopleCategory(null)}
          >
            ‹ 返回分类
          </button>
          <div className="tree-list">
            {people.map((item) => (
              <button key={item} onClick={() => setPerson(item)}>
                <b>{item}</b>
                <small>
                  {peopleTrace[item][peopleCategory].slice(0, 22)}…　›
                </small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button className="inner-back" onClick={() => setPerson(null)}>
            ‹ 返回人物
          </button>
          {card(
            peopleCategory,
            peopleTrace[person][peopleCategory],
            person,
          )}
        </>
      )}
    </>
  );
  const personEvidence = person
    ? evidence.filter(
        (item) =>
          item.owner === person && item.kind === "搜人" && phaseOpen(item.id),
      )
    : [];
  const locationNames = [
    ...new Set(
      evidence
        .filter((item) => item.kind === "搜地点" && phaseOpen(item.id))
        .map((item) => item.title.split(" · ")[0]),
    ),
  ];
  const locationEvidence = location
    ? evidence.filter(
        (item) =>
          item.kind === "搜地点" &&
          item.title.startsWith(location) &&
          phaseOpen(item.id),
      )
    : [];
  const deepOtherEvidence = evidence.filter(
    (item) => item.kind === "其他" && cluePhase[item.id] === "深层线索",
  );
  return (
    <div className="content-screen search-screen">
      <div className="screen-intro">
        <span>EVIDENCE HUB</span>
        <h2>搜证</h2>
        <p>按人物、资料类型或地点逐层查找，不再把所有线索堆在同一层。</p>
      </div>
      <div className="search-phase-tabs">
        {(["第一幕", "第二幕", "案发当天"] as const).map((item) => (
          <button
            key={item}
            className={phase === item ? "active" : ""}
            onClick={() => {
              setPhase(item);
              back();
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {phase === "案发当天" ? (
        <section className="deep-clue-view">
          <div className="deep-clue-heading">
            <b>案发当天</b>
            <span>已完整开放</span>
          </div>
          <div className="evidence-stack deep-other-evidence">
            {deepOtherEvidence.map(evidenceCard)}
          </div>
          <div className="deep-script-stack">
            {people.map((item) => (
              <article className="deep-script-card" key={item}>
                <h3>{item} · 案发当晚</h3>
                <ScriptProse
                  role={item}
                  text={roleDayTwoSection(item, "E-案发当晚")}
                />
              </article>
            ))}
          </div>
        </section>
      ) : (
        <>
          <div className="search-hub-tabs">
            {(["搜人", "其他"] as const).map((item) => (
              <button
                key={item}
                className={section === item ? "active" : ""}
                onClick={() => openSection(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {section === "其他嫌疑人" && peopleView}
          {section === "搜人" && (
        <>
          {!person ? (
            <div className="tree-list">
              {people.map((item) => (
                <button key={item} onClick={() => setPerson(item)}>
                  <b>{item}</b>
                  <small>查看该角色的搜人线索　›</small>
                </button>
              ))}
            </div>
          ) : (
            <>
              <button className="inner-back" onClick={back}>
                ‹ 返回角色
              </button>
              {drawPanel(personEvidence, `搜查 ${person}`)}
              <div className="evidence-stack">
                {knownEvidence(personEvidence).map(evidenceCard)}
              </div>
              {personEvidence.length === 0 && (
                <div className="empty-state">该角色的搜人线索尚未开放。</div>
              )}
            </>
          )}
        </>
          )}
          {section === "搜地点" && (
        <>
          {!location ? (
            <div className="tree-list">
              {locationNames.map((item) => (
                <button key={item} onClick={() => setLocation(item)}>
                  <b>{item}</b>
                  <small>查看该地点的搜证线索　›</small>
                </button>
              ))}
            </div>
          ) : (
            <>
              <button className="inner-back" onClick={() => setLocation(null)}>
                ‹ 返回地点
              </button>
              {drawPanel(locationEvidence, `搜查 ${location}`)}
              <div className="evidence-stack">
                {knownEvidence(locationEvidence).map(evidenceCard)}
              </div>
            </>
          )}
        </>
          )}
          {section === "其他" && (
        <>
          {otherView === "home" && (
            <div className="empty-state">
              其他资料暂不开放。新闻、百科与传闻已移出搜证，后续内容待从线索本文件夹重新录入。
            </div>
          )}
          {otherView === "news" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <NewsScreen />
            </>
          )}
          {otherView === "encyclopedia" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <EncyclopediaScreen
                unlockedAct={unlockedAct}
              />
            </>
          )}
          {otherView === "rumor" && (
            <>
              <button
                className="inner-back"
                onClick={() => setOtherView("home")}
              >
                ‹ 返回其他
              </button>
              <RumorContent />
            </>
          )}
        </>
          )}
        </>
      )}
    </div>
  );
}

function ArchiveScreen() {
  return (
    <div className="content-screen">
      <div className="screen-intro">
        <span>PRIVATE ARCHIVE</span>
        <h2>今日任务</h2>
        <p>只在你的手机里显示，不会自动同步给其他玩家。</p>
      </div>
      <div className="archive-hero">
        <div className="archive-avatar">沉</div>
        <div>
          <b>向沉 · 愤怒</b>
          <small>被系统判定为低风险的人，仍然需要有人去找。</small>
        </div>
      </div>
      <div className="archive-stats">
        <div>
          <b>04</b>
          <small>我搜到</small>
        </div>
        <div>
          <b>02</b>
          <small>已公开</small>
        </div>
        <div>
          <b>01</b>
          <small>待确认</small>
        </div>
      </div>
      <div className="archive-log">
        <b>最近访问</b>
        <p>21:15 · 西侧书房 · 单面镜</p>
        <p>20:40 · 向沉 · 旧式九键手机</p>
        <p>昨夜 · 幼儿园样本 · 大班</p>
      </div>
    </div>
  );
}

function SocialScreen({ role }: { role: Role }) {
  const profile =
    role === "章貘"
      ? {
          mark: "默",
          title: "章貘的收藏夹",
          headline: "塔罗 AI 授权短片：分离手仍能被操控",
          copy: "收藏 · 智能义手、身体与意识分离、AI 授权技术",
          foot: "章貘　昨天",
        }
      : role === "胡谋"
        ? {
            mark: "谋",
            title: "胡谋的收藏夹",
            headline: "塔罗公司的 AI 授权短片",
            copy: "收藏 · 分离手实验、远程操控、仿生技术、授权宣传",
            foot: "胡谋　3小时前",
          }
        : {
            mark: "沉",
            title: "向沉的收藏夹",
            headline: "AI 授权短片：离开身体后仍能操控",
            copy: "收藏 · 塔罗公司、智能仿生手、分离手实验",
            foot: "向沉　昨天",
          };
  return (
    <div className="content-screen social-screen">
      <div className="social-top">
        <b>小某书</b>
        <span>⌕　♡　♧</span>
      </div>
      <div className="social-profile">
        <div className="social-avatar">{profile.mark}</div>
        <div>
          <b>{profile.title}</b>
          <small>不公开的生活，也会留下浏览记录</small>
        </div>
      </div>
      <div className="social-feed">
        <div className="post-card">
          <img
            className="social-evidence-image"
            src="/hand-control-news.png"
            alt="分离手仍能被控制的新闻截图"
          />
          <b>{profile.headline}</b>
          <p>{profile.copy}</p>
          <small>{profile.foot}</small>
        </div>
        <div className="post-card">
          <img
            className="social-evidence-image"
            src="/ai-authorization-news.png"
            alt="王祖贤 AI 授权短片截图"
          />
          <b>AI 授权短片：美得不像话</b>
          <p>
            短片展示了塔罗公司的 AI
            授权宣传，重点是身体脱离后仍能接受指令并完成动作。
          </p>
          <small>塔罗公司相关内容　近期</small>
        </div>
      </div>
    </div>
  );
}

function NewsScreen() {
  return (
    <div className="content-screen news-screen">
      <div className="news-masthead">
        <b>新闻</b>
        <span>社会　科技　本地</span>
      </div>
      <article className="news-company">
        <img src="/hand-control-news.png" alt="塔罗公司智能仿生手新闻" />
        <small>科技伦理 · 塔罗公司介绍</small>
        <h3>塔罗公司：让身体成为可远程调用的接口</h3>
        <p>
          塔罗公司对外宣传称，智能仿生手能够让使用者“分离身体与意识，继续掌控现实”。新闻截图中展示了离开身体后仍可操控的手部实验。
        </p>
      </article>
      <div className="news-list">
        <article>
          <small>科技伦理 · 3小时前</small>
          <b>“意识天堂”项目再次获得阶段性资金支持</b>
          <p>
            支持者称数字人格保存能够减少失去，反对者则追问：被保存的究竟是谁？
          </p>
        </article>
        <article>
          <small>社会 · 昨日</small>
          <b>一批旧医疗数据被匿名出售，患者本人未收到通知</b>
          <p>数据流向暂不明，平台表示正在核查。</p>
        </article>
        <article>
          <small>动物保护 · 4日前</small>
          <b>动物实验记录中，“恐惧”被统一改写为“应激反应”</b>
          <p>研究人员认为这是标准化术语，网友和一些热爱动物的人士对此提出异议。</p>
        </article>
        <article>
          <small>技术 · 2日前</small>
          <b>塔罗公司发布“次级 Agent”执行框架</b>
          <p>说明称，上级 AI 可将具体操作交由低一级 Agent 执行，目标与权限仍由上级任务边界决定。</p>
        </article>
        <article>
          <small>技术 · 1日前</small>
          <b>内部 VR 模型升级包引发合规讨论</b>
          <p>面向内部训练的沙盒模型可安装功能包与升级包进行测试，但无法连接外部网络。</p>
        </article>
      </div>
    </div>
  );
}

function HeadlinesScreen() {
  const [tab, setTab] = useState<"news" | "rumor">("news");
  return (
    <div className="content-screen news-screen">
      <div className="news-masthead">
        <b>近日头条</b>
        <span>靠谱新闻 · 离谱传闻</span>
      </div>
      <div className="encyclopedia-tabs">
        <button className={tab === "news" ? "active" : ""} onClick={() => setTab("news")}>
          靠谱新闻
        </button>
        <button className={tab === "rumor" ? "active" : ""} onClick={() => setTab("rumor")}>
          离谱传闻
        </button>
      </div>
      {tab === "news" ? <NewsScreen /> : <RumorScreen />}
    </div>
  );
}

function RumorContent() {
  return (
    <div className="rumor-list">
      <div className="rumor-group">
        <h3 className="rumor-group-title">近日头条 · 一</h3>
        <article className="evidence-card">
          <small>传闻 01</small>
          <p>近日神经科学、哲学、信息理论相继取得突破，公司成功构建了真正有主观体验的系统。这一进步将实现vr模拟真实感和ai对话活人感的跃迁，随之而来的大量法律伦理问题引发了社会的激烈讨论，据说公司想要把这次节目当成回应争议的一次发布会，作为前公司人道技术中心主任的陆驰寂将在节目中为大家解释公司对伦理边界作出的坚守和努力。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 02</small>
          <p>据说公司新开发的综艺项目可以全自动生成节目剧本，并且可以定制明星换脸。这个过程完全是塔罗斯自动生成的，大家对「0人工参与， AI创作」的看法并不乐观，大多数人认为没有人工参与肯定不行，也有人认为这只是公司噱头，AI生成的节目肯定会有很多莫名其妙的情节。但能让顶流明星在静夜园录制还是饱受大众期待，目前社会讨论度很高。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 03</small>
          <p>杨塔罗是塔罗公司的高管，表情严肃，行程神秘，常参与慈善活动，作为公司的发言人在镜头前露面，有时他连续好几天参加活动但状态依旧饱满说话滴水不漏，有人评价他作为总裁果然不是常人能比拟的，也有人怀疑他背后靠的是强大的团队，甚至有替身的传言。</p>
        </article>
      </div>
      <div className="rumor-group">
        <h3 className="rumor-group-title">近日头条 · 二</h3>
        <article className="evidence-card">
          <small>传闻 04</small>
          <p>据说静夜园是杨塔罗私人岛屿上的庄园，没人知道那个岛在哪，是否真的存在，甚至传出了很多恐怖的传说。有人笑称那是禁闭岛，是非法乱纪的世外桃源。最出名的传言是庄园每隔一段时间就会多出一间房。某些消失的人也会在庄园再次出现。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 05</small>
          <p>意识天堂实验是公司近期投入大量资本开发的主推项目，正在招募自愿参与者和项目实习生。这是一个充满争议的项目，虽然仍处于实验阶段并且面临大量法律阻力，但有传言称公司内部有人已经开始使用该项目。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 06</small>
          <p>当年全知公司的AI加入辅助医疗确实让数据各方面都有所提升，但很多出事患者的家属，把责任归属给AI公司，很多AI医疗事故最终无法追责，或者只能以"医疗纠纷"的方式模糊处理，由医院或保险公司赔偿，而不是真正追究技术本身的责任。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 07</small>
          <p>全知公司不是第一次触及伦理红线了，之前VR超真体验模拟模型-西部世界，被指过于真实，玩家需要带上头盔，连接各种贴片，在模拟中的所有感受都会实时反馈到肉体。后来由于大量玩家对AI NPC虐杀激发了人的暴力。被官方警告叫停了。</p>
        </article>
      </div>
      <div className="rumor-group">
        <h3 className="rumor-group-title">近日头条 · 三（完结）</h3>
        <article className="evidence-card">
          <small>传闻 08</small>
          <p>全知公司因违规操作被官方处罚破产后被塔罗公司收购，据说其实全知公司本就是为塔罗公司做非法信息收集的公司，最后把替罪羊抓进去，收购公司，再把那些非法数据合理洗白为母公司自己使用。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 09</small>
          <p>意识天堂实验是公司近期投入大量资本开发的主推项目，正在招募自愿参与者和项目实习生。这是一个充满争议的项目，虽然仍处于实验阶段并且面临大量法律阻力，但有传言称有人已经开始使用项目。</p>
        </article>
        <article className="evidence-card">
          <small>传闻 10</small>
          <p>据说为打造意识天堂中的路人和真实的人类潜意识情感行动，塔罗公司需要真实的人类在休眠仓内提取意识作为训练材料。这个方案一经提出就被法律明令禁止了。公司法务正在与官方进行协商斡旋。</p>
        </article>
      </div>
    </div>
  );
}

function RumorScreen() {
  return <RumorContent />;
}

function MemoryScreen({
  role,
  target,
  setTarget,
  tokens,
  unlocked,
  allowedTargets,
  unlock,
  dmMode = false,
}: {
  role: PlayerRole;
  target: PlayerRole;
  setTarget: (role: PlayerRole) => void;
  tokens: number;
  unlocked: string[];
  allowedTargets: PlayerRole[];
  unlock: (role: PlayerRole) => void;
  dmMode?: boolean;
}) {
  const roles: PlayerRole[] = ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙"];
  const memoryText: Record<PlayerRole, string> = {
    向沉:
      "数个 AI 反动组织先后宣称成员失踪。向沉顺着名单继续查下去，发现失踪者远不止组织成员：他们大多是系统评估里的低价值、低优先级人群。\n\n他没有立刻得出结论，只把名单、病历修改痕迹与失踪时间一项项对齐。有人正在挑选那些不容易被追问的人。",
    胡谋:
      "塔罗斯把节目设计任务交给胡谋：通过七宗罪真人推理综艺采集参与者在真实压力下的情绪反应，用于模型升级。\n\n她在设计笔记里写，人类情感最难模仿的部分并不是愤怒或悲伤，而是意外、失控和自以为没有被观察时做出的选择。她又从人类对待动物的方式推演：人会按照动物的功能、外表和可利用程度，决定该对它投射何种情感；所谓共情往往只是人类中心主义允许发生的版本。\n\n她认为，若连动物的痛苦都能被改写为效率、人类的情感也未必比谎言更可靠。于是她把动物幼儿园设计成一面镜子，让参与者在自己熟悉的伦理双标里暴露情绪。",
    章貘:
      "章貘曾与塔罗公司保持深度合作关系。有人看见她频繁进出公司，参与过 Echo、智能义手与意识天堂相关项目；但最近一段时间，她忽然不再出现。\n\n她曾以为，被保存的意识至少还能在某处继续与鹤说话。后来她发现，公司保存的并不只是“一个人”，也会复制其中可被调用的偏好、记忆和情感反应。她开始追问：被留在天堂里的那份自己，是否知道还有另一份正在替别人工作？",
    朱渴焰:
      "朱渴焰的日记里写，她每天都会做同一个梦：白色床单、养猪场、父亲不断重复“合格”和“不合格”。梦里有一只长势不达标的小猪，被人抱起来，又被重重摔下。\n\n她每次醒来都不记得自己为什么会哭，只记得那只小猪看向人的眼神，像仍在等待被带回家。",
    牛守拙:
      "你和四名大学生一起进入公司的一个房间。他们好像互相认识，有说有笑。你心想，现在的年轻人真好，生在一个 AI 的时代。\n\n负责人说，你们要去杨塔罗的庄园，没人知道那座庄园在哪；只要戴上面罩进入房间，醒来时就会抵达。杨塔罗不是公司最高的负责人吗？想不到这次工作机会居然这么难得，朱渴焰真的帮了你很多。你没多想，赶紧戴上面罩走了进去。\n\n等再次醒来，你已经到了庄园。脑子昏昏沉沉，像宿醉一样，完全不记得自己是怎么来的。你望向四周，看见朱渴焰和几张陌生的脸；他们看起来和你的情况差不多。",
  };
  const isOpen = unlocked.includes(target);
  const authorized = allowedTargets.includes(target);
  return (
    <div className="content-screen memory-screen">
      <div className="screen-intro">
        <span>DEEP MEMORY / TOKEN GATE</span>
        <h2>深层记忆</h2>
        <p>
          {dmMode
            ? "DM 预览：全部深层记忆均已开放。"
            : "重要信息被放在记忆深处。每条解锁消耗 20K Token，且需要 DM 授权。"}
        </p>
      </div>
      {!dmMode && (
        <div className="token-balance">
          <span>当前 K Token</span>
          <b>{tokens}K</b>
          <small>每条记忆 · 20K</small>
        </div>
      )}
      <div className="memory-targets">
        {roles.map((item) => (
          <button
            key={item}
            className={target === item ? "active" : ""}
            onClick={() => setTarget(item)}
          >
            {item}
            {item === role && !dmMode ? " · 我" : ""}
          </button>
        ))}
      </div>
      <div className={`memory-card ${isOpen ? "opened" : ""}`}>
        {isOpen ? (
          <>
            <small>MEMORY UNLOCKED · {target}</small>
            <p>{memoryText[target]}</p>
            <span>深层记忆只是入口，完整内容需要在线索中继续拼合。</span>
          </>
        ) : (
          <>
            <div className="memory-lock">20</div>
            <b>{target} 的深层记忆</b>
            <p>
              {authorized
                ? "重要信息被折叠在个人经历之后。"
                : "主持人尚未授权这条深层记忆。"}
            </p>
            <button
              onClick={() => unlock(target)}
              disabled={!authorized || tokens < 20}
            >
              {!authorized
                ? "等待 DM 授权"
                : tokens < 20
                  ? "K Token 不足"
                  : "消耗 20K Token 解锁"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NotesScreen({
  note,
  setNote,
}: {
  note: string;
  setNote: (value: string) => void;
}) {
  return (
    <div className="content-screen notes-screen">
      <div className="screen-intro">
        <span>LOCAL NOTES</span>
        <h2>备忘录</h2>
        <p>只保存在当前手机上的临时记录。</p>
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="写下你的推理、疑点或还没有公开的线索……"
      />
      <small className="note-count">{note.length} 字 · 本地草稿</small>
    </div>
  );
}

function HackerScreen({
  tokens,
  lookups,
  setLookups,
}: {
  tokens: Record<PlayerRole, number>;
  lookups: PlayerRole[];
  setLookups: (value: PlayerRole[]) => void;
}) {
  const roles: PlayerRole[] = ["向沉", "胡谋", "章貘", "朱渴焰", "牛守拙"];
  const remaining = Math.max(0, 2 - lookups.length);
  function inspect(target: PlayerRole) {
    if (remaining > 0 && !lookups.includes(target))
      setLookups([...lookups, target]);
  }
  return (
    <div className="content-screen hacker-screen">
      <div className="simple-app-mark">码</div>
      <div className="screen-intro">
        <span>LOCAL ACCESS / H-04</span>
        <h2>编程</h2>
        <p>
          任意环节可发动。查询其他角色当前 K
          Token，每次只能选择一个角色，最多查询两人。
        </p>
      </div>
      <div className="hacker-uses">
        <span>剩余查询次数</span>
        <b>{remaining} / 2</b>
      </div>
      <div className="hacker-token-list">
        {roles.map((item) => {
          const seen = lookups.includes(item);
          return (
            <button
              key={item}
              className={seen ? "seen" : ""}
              onClick={() => inspect(item)}
              disabled={seen || remaining === 0}
            >
              <span>{item}</span>
              <small>
                {seen
                  ? `当前 K Token：${tokens[item]}K`
                  : remaining === 0
                    ? "查询次数已用完"
                    : "点击查询"}
              </small>
            </button>
          );
        })}
      </div>
      <div className="empty-app-box">
        <span>LOCAL QUERY LOG</span>
        <b>
          {lookups.length === 0 ? "尚未查询" : `已查询：${lookups.join("、")}`}
        </b>
      </div>
    </div>
  );
}

function SimpleAppScreen({
  title,
  code,
  text,
}: {
  title: string;
  code: string;
  text: string;
}) {
  return (
    <div className="content-screen simple-app-screen">
      <div className="simple-app-mark">{title.slice(0, 1)}</div>
      <div className="screen-intro">
        <span>{code}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="empty-app-box">
        <span>APP MODULE EMPTY</span>
        <b>后续内容待接入</b>
      </div>
    </div>
  );
}

function BackdoorScreen() {
  return (
    <div className="content-screen simple-app-screen">
      <div className="simple-app-mark">门</div>
      <div className="screen-intro">
        <span>TALOS / BACKDOOR</span>
        <h2>塔洛斯后门</h2>
        <p>案发当天结束后才出现的内部入口。只有胡谋的终端能够访问。</p>
      </div>
      <div className="backdoor-list">
        <button
          className="evidence-card"
          style={{ textAlign: "left", width: "100%" }}
        >
          <b>朱可彦</b>
          <small>个人终端 · 资料读取</small>
          <span>›</span>
        </button>
        <button
          className="evidence-card"
          style={{ textAlign: "left", width: "100%" }}
        >
          <b>杨塔罗</b>
          <small>管理终端 · 权限记录</small>
          <span>›</span>
        </button>
      </div>
    </div>
  );
}

function EncyclopediaScreen({ unlockedAct }: { unlockedAct: number }) {
  const [tab, setTab] = useState<"ai" | "myth" | "animal">("ai");
  const [animalTab, setAnimalTab] = useState<"age" | "material">("age");
  return (
    <div className="content-screen encyclopedia-screen">
      <div className="screen-intro">
        <span>ENCYCLOPEDIA / SEARCH</span>
        <h2>百科全书</h2>
        <p>查询人物原型、动物心智年龄，以及被系统遗漏的资料。</p>
      </div>
      <div className="encyclopedia-tabs">
        <button
          className={tab === "ai" ? "active" : ""}
          onClick={() => setTab("ai")}
        >
          AI百科
        </button>
        <button
          className={tab === "myth" ? "active" : ""}
          onClick={() => setTab("myth")}
        >
          希腊神话
        </button>
        <button
          className={tab === "animal" ? "active" : ""}
          onClick={() => setTab("animal")}
        >
          动物百科
        </button>
      </div>
      {tab === "ai" ? (
        <div className="encyclopedia-list myth-list">
          <article>
            <b>Token</b>
            <span>这个时代的硬通货</span>
            <p>
              无论是闭源模型还是开源模型，使用模型都必然需要消耗 token，已然成为这个时代的硬通货。
            </p>
          </article>
          <article>
            <b>闭源模型</b>
            <span>以断网换来的自由度</span>
            <p>
              利用基础开源大模型训练自己的模型，以断网为代价，可以突破 AI 的很多限制，只要不进行违法事务和商业牟利，理论上有足够的算力和配置可以发挥意想不到的作用。
            </p>
          </article>
          <article>
            <b>塔罗斯5438</b>
            <span>孤岛上的自用升级版</span>
            <p>
              孤岛静夜园上的 AI 智能闭源模型，不与外界联网，公司开发自用的升级版，依托于公司强大的算力和硬件具有先进的拟人科技。据说有着公司研发的庞大数据库。
            </p>
          </article>
          <article>
            <b>脑机接口</b>
            <span>只能旁观，不能干预</span>
            <p>
              沉浸式读取记忆，用于第一视角录制和读取，只能旁观不能干预。
            </p>
          </article>
          <article>
            <b>次级 agent</b>
            <span>带着目的降生的执行者</span>
            <p>
              有些 AI 会把任务分供给比他低一等级的 AI 进行操作和行动，这种次级 agent 的产生是带着极强的目的性的，完成任务后便会消失。
            </p>
          </article>
          <article className="talos-entry">
            <b>VR 体验</b>
            <span>与现实完全相同的世界</span>
            <p>
              体验者需佩戴眼罩，坐入类似按摩椅的接入设备。为了增强沉浸感，体验中的世界如无特殊说明和现实世界完全相同，系统会同步多种真实感受；长时间体验后，使用者可能暂时混淆自身身份和记忆。健康人类在体验中受到伤害，现实生活中的身体也会有一定影响。VR 有一定的安全保护措施与时长限制。
            </p>
          </article>
          <article className="talos-entry">
            <b>后门</b>
            <span>从模拟里醒来的方式</span>
            <p>
              VR 体验除了在模拟外的现实世界退出，还可以在模拟中找到后门，穿过后门从而从现实中清醒过来。
            </p>
          </article>
          <article className="talos-entry">
            <b>重大突破</b>
            <span>缸中之脑</span>
            <p>
              原理：传统 AI 只识别统计推断文字和图像，对于物理规律、情绪感受是缺乏的。在模拟中读取潜意识信号，缸中之脑。
            </p>
          </article>
        </div>
      ) : tab === "myth" ? (
        <div className="encyclopedia-list myth-list">
          <article>
            <b>向沉 · 德墨忒尔</b>
            <span>用自己的痛苦，让整个世界跟着一起死去</span>
            <p>
              德墨忒尔是丰收与农业女神，她的权能覆盖整个人间秩序。女儿珀耳塞福涅是她最亲密的存在，是她作为母亲的骄傲，也是她情感世界中最柔软的部分。当哈迪斯将珀耳塞福涅掳入冥界时，她的世界崩塌了：她离开奥林匹斯，在人间游荡，拒绝让种子发芽，让大地荒芜。万物不再生长，人类面临饥荒，诸神开始恐慌。她用自己的痛苦，让整个世界跟着一起死去。
            </p>
          </article>
          <article>
            <b>胡谋 · 赫尔墨斯</b>
            <span>从不停留，所以必须不断算计</span>
            <p>
              赫尔墨斯从出生起就不曾停下。他偷走阿波罗的牛群，用倒行的足迹伪装方向，面对质问又靠狡辩与琴声颠倒黑白，将一场盗窃变成诸神间的笑谈；此后他脚生双翼，在奥林匹斯、人间与冥界之间永不停歇地穿行，替宙斯传令，为亡者引路，替纠纷解套，为欺骗圆谎。他的聪明在缝隙中周旋；他的欺骗是生存本能。正因为他从不停留，才必须不断算计。
            </p>
          </article>
          <article>
            <b>章貘 · 皮格马利翁</b>
            <span>把所有愿意爱的东西，一点点剥出来放进象牙里</span>
            <p>
              皮格马利翁是塞浦路斯的一位雕刻家。他用象牙刻了一尊女人像，日复一日地雕琢，眼睛、手指的姿态，每一处都按照他心中最完美的样子成形。那不是对某一个人的模仿，而是把所有他愿意爱的东西，从世界里一点点剥离出来，放进一块象牙里。他给她起名伽拉忒亚，给她穿上最柔软的衣袍，戴上戒指与项链。他向阿芙洛狄忒祈祷后伽拉忒亚活了过来——当他再次亲吻雕像时，她的唇是温热的，皮肤有了弹性，脉搏在皮肤下跳动。
            </p>
          </article>
          <article>
            <b>伽拉忒亚</b>
            <span>从被创造的那一刻起，就不是独立的人</span>
            <p>
              伽拉忒亚从被创造的那一刻起，就注定了她不是一个独立的人，而是一份“被期待”的存在。她的身体是按皮格马利翁的幻想塑造的，她的美丽是为了满足他的注视，她的生命是为了回应他的爱。她没有过去，没有童年，没有任何一段不属于他的记忆。她睁开眼睛，第一个看到的人就是创造她的人；她开口说话，第一句话可能就是喊出他的名字。她的世界从一开始就只有他。她应当常常想过：我是谁？是那尊象牙雕像，还是一个被爱唤醒的女人？如果没有他的爱，我是否还会存在？
            </p>
          </article>
          <article>
            <b>厄科与纳西索斯</b>
            <span>爱被惩罚成了一种空洞的回声</span>
            <p>
              纳西索斯长得极美，许多仙女和少年爱慕他，可他全都拒绝了。其中有一个仙女因为多嘴，被罚只能重复别人说过的话的最后几个字——她的爱被惩罚成了一种空洞的回声。厄科跟在纳西索斯身后，藏在树林里，在他迷路时重复着他的尾音。可纳西索斯只听到自己的声音被山谷回应。最后他发现了她，厌恶地走开。厄科被拒绝后身体日益消瘦，最后只剩下声音在山谷里回荡。众神被激怒，让纳西索斯来到一汪清泉边。他第一次看见了自己的脸——一个从未见过的、美得令人心碎的存在，他爱上了自己的倒影，死在泉边。众神把他变成一朵花，花茎细长，花头低垂，永远俯身朝向水面。那是水仙花。
            </p>
          </article>
          <article>
            <b>朱渴焰 · 普罗米修斯</b>
            <span>把知识和火交给人类，也承担知识造成的后果</span>
            <p>
              普罗米修斯把火带给人类，因此受到宙斯惩罚。朱渴焰在塔罗公司里接触技术、实验与意识项目，最初相信知识能救人，后来不得不面对知识也能成为伤害人的工具。
            </p>
          </article>
          <article>
            <b>牛守拙 · 西西弗斯</b>
            <span>石头滚下来，再推，再滚下</span>
            <p>
              西西弗斯聪明得近乎狡猾，是希腊神话里最不愿向规则低头的人之一。他做过很多越界的事：他偷过神祇的秘密，又把自己的聪明用到人类不该碰的地方，最出名的一件，是他两次欺骗了死神。诸神给他的惩罚是：把一块巨石推上山顶。每一次，他弯腰、用力、顶着石头，汗水流进眼睛，一点点把它推上去。可快到山顶时，石头就会滚下来。他再下去，再推，再滚下。一日一日，永无止境。
            </p>
          </article>
          <article className="talos-entry">
            <b>塔罗斯 · Talos</b>
            <span>被制造出来守卫一座岛，从未被允许做别的事</span>
            <p>
              塔罗斯是希腊神话里的青铜巨人，用来守卫岛屿。他是完美的守卫者：不需要睡觉，不会动摇，没有任何私欲。整个克里特岛的安全都系在他身上。他只有这一个功能，也只有这一个命运。他的生命系于一个致命的物理弱点——脚踝上的一根青铜钉。钉子里封着他体内唯一一条血管，只要钉子还在，他就永远活着，永远执行那个他生来就被赋予的指令。后来女巫走到塔洛斯面前，她承诺让他变成真正的人类，骗他拔掉了脚踝上的那根钉子。塔罗斯拔掉钉子后血流而死。
            </p>
          </article>
        </div>
      ) : unlockedAct < 1 ? (
        <div className="empty-state">
          动物百科需要在第二幕“幼儿园样本”开放后查看。
        </div>
      ) : (
        <div>
          <div className="encyclopedia-tabs sub-tabs">
            <button
              className={animalTab === "age" ? "active" : ""}
              onClick={() => setAnimalTab("age")}
            >
              儿童心智年龄
            </button>
            <button
              className={animalTab === "material" ? "active" : ""}
              onClick={() => setAnimalTab("material")}
            >
              动物处境
            </button>
          </div>
          {animalTab === "age" ? (
            <div className="animal-age-page">
              <div className="age-axis">
                <span>2 岁</span>
                <i />
                <span>3 岁</span>
                <i />
                <span>5 岁</span>
                <i />
                <span>7 岁</span>
              </div>
              <article>
                <b>小班 · 鸡、羊</b>
                <span>约 2–3 岁</span>
                <p>
                  已能感知、学习并形成情绪反应。鸡能理解物体恒存、区分数量；羊会跟随同伴，也会受群体情绪影响。系统以编号和数量管理它们，个体性最容易被抹去。
                </p>
              </article>
              <article>
                <b>中班 · 猪、比格犬、马</b>
                <span>约 3–5 岁；比格犬偏低</span>
                <p>
                  猪能记忆、解决问题并建立信任；马能辨认喜怒和恐惧；比格犬对人高度依恋、服从。它们会困惑、会害怕，却常被叙事翻译成“温顺”“勇敢”或“实验适配”。
                </p>
              </article>
              <article>
                <b>大班 · 牛、大象、海豚、章鱼、导盲犬</b>
                <span>约 3–7 岁，能力差异极大</span>
                <p>
                  牛能辨认同伴并发生情绪传染；大象会记住创伤、哀悼同类；海豚有复杂社会关系；章鱼拥有分布式神经系统；导盲犬能建立长期依恋。被看见的聪明，往往只被用来制造感动或提高利用效率。
                </p>
              </article>
            </div>
          ) : (
            <div className="animal-material-list">
              <article>
                <b>鸡与羊 · 狭小空间</b>
                <p>
                  鸡能理解物体恒存、做简单数量判断；羊有稳定的群体关系。它们被安排在过度拥挤、彼此相似的格位中，个体只剩编号。
                </p>
              </article>
              <article>
                <b>猪 · 信任被利用</b>
                <p>
                  猪聪明、会记人、会记仇，也会信任照料者。生长不达标时被当作损耗处理；承认它的聪明，会让“肉”的叙事变得难以维持。
                </p>
              </article>
              <article>
                <b>比格犬与导盲犬 · 依恋与耗材</b>
                <p>
                  比格犬温顺、对人依恋，常被视为实验“适配”；导盲犬的困惑与退役适应，被写成管理记录而不是情感需要。
                </p>
              </article>
              <article>
                <b>马 · 被叫作勇敢</b>
                <p>
                  马能辨认人的愤怒与开心，也会恐惧疼痛。人类把训练出的服从、僵住的恐惧，包装成忠诚、勇敢与高贵。
                </p>
              </article>
              <article>
                <b>牛 · 焦虑被译成参数</b>
                <p>
                  牛会认识同伴、感受疼痛。产奶量下降前步数增多，是恐惧与焦虑；管理手册把它写作“运动量异常波动”，再用镇静剂恢复进食。
                </p>
              </article>
              <article>
                <b>鹿 · 反复采割</b>
                <p>
                  鹿茸被反复采割，痛感和惊恐被生产流程遮蔽。被称作“原料”以后，身体就不再被叙述为一个生命。
                </p>
              </article>
              <article>
                <b>狐狸与寄生蜂 · 接近与入侵</b>
                <p>
                  狐狸会用受伤姿态接近猎物，却又被关在笼中等待皮毛被取走。寄生蜂以几乎不被宿主察觉的方式进入身体：温和并不等于没有侵入。
                </p>
              </article>
              <article>
                <b>大象 · 木桩与习得性无助</b>
                <p>
                  幼象被固定在木桩旁，长大后即使拥有挣脱的力量，也可能不再尝试。它们会哀悼同伴，人们为此感动，却继续要求它们表演。
                </p>
              </article>
              <article>
                <b>海豚 · 永远上扬的嘴角</b>
                <p>
                  海豚高度聪明、有复杂社群，也会哀悼同伴。嘴角上扬只是面部结构，不是快乐；水池、表演与声呐反射造成的压力却常被忽略。
                </p>
              </article>
              <article>
                <b>章鱼 · 不像人的聪明</b>
                <p>
                  每条触手都有相对独立的神经处理能力，会用工具、会逃脱、会认人。因为外形怪异，它的情感常被排除在共情范围之外；失去触手被当成可以再生的代价。
                </p>
              </article>
              <article>
                <b>鹤、灰雁、鸭嘴兽 · 难以归类</b>
                <p>
                  鹤与灰雁会维持长期伴侣关系，伴侣死亡后可能反复回到原处；鸭嘴兽式的存在不符合熟悉分类。人类常把“不像我”误写成“不重要”。
                </p>
              </article>
              <article>
                <b>有毒动物 · 章鱼与蛇</b>
                <p>
                  蓝环章鱼和某些蛇带有毒性。危险不等于没有情感，也不等于可以被剥夺被理解的资格。
                </p>
              </article>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TarotScreen({
  question,
  setQuestion,
  note,
  setNote,
  unlockedAct,
  onOpenLock,
}: {
  question: string;
  setQuestion: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  unlockedAct: number;
  onOpenLock: () => void;
}) {
  const answers: Record<string, string> = {
    向沉: "他不是在找一个人。他在找一个不被系统删除的证据。",
    胡谋: "她相信善意可以被使用，所以也相信自己无法被善意拯救。",
    章貘: "她问存在是什么。请先确认，谁还在回应。",
  };
  const answer = answers[question];
  return (
    <div className="content-screen tarot-screen">
      <div className="tarot-mark">塔</div>
      <div className="screen-intro">
        <span>TALOS / LIMITED ANSWERS</span>
        <h2>塔罗斯</h2>
        <p>只能询问指定对象。答案不会解释自己为什么是真的。</p>
      </div>
      <div className="question-list">
        {Object.keys(answers).map((name) => (
          <button
            key={name}
            className={question === name ? "active" : ""}
            onClick={() => setQuestion(name)}
          >
            关于{name}
          </button>
        ))}
      </div>
      {answer && (
        <div className="tarot-answer">
          <small>响应对象：{question}</small>
          <p>{answer}</p>
        </div>
      )}
      <NotesScreen note={note} setNote={setNote} />
      {unlockedAct >= 3 && (
        <button className="tarot-final-room-button" onClick={onOpenLock}>
          进入密室终局　›
        </button>
      )}
    </div>
  );
}

function LockScreen({
  code,
  unlocked,
  pressKey,
  reset,
}: {
  code: string;
  unlocked: boolean;
  pressKey: (key: string) => void;
  reset: () => void;
}) {
  const [projectionDone, setProjectionDone] = useState(false);
  const [projectionPhotos, setProjectionPhotos] = useState<string[]>([]);
  useEffect(() => {
    const onProjectionComplete = (event: MessageEvent) => {
      if (event.data?.type === "vector-puzzle-complete") {
        if (Array.isArray(event.data.photos)) {
          setProjectionPhotos(event.data.photos.slice(0, 5));
        }
        setProjectionDone(true);
      }
    };
    window.addEventListener("message", onProjectionComplete);
    return () => window.removeEventListener("message", onProjectionComplete);
  }, []);
  if (unlocked)
    return (
      <div className="unlock-screen">
        <div className="unlock-ring">✓</div>
        <span>DOOR SIGNAL ACCEPTED</span>
        <h2>镜门已响应</h2>
        <p>不是门被打开了。是系统终于承认，这里存在过另一个出口。</p>
        <button onClick={reset}>重新演示</button>
      </div>
    );
  if (!projectionDone)
    return (
      <div className="lock-screen projection-lock">
        <div className="screen-intro">
          <span>FINAL ROOM / PROJECTION GAME</span>
          <h2>投影解谜</h2>
          <p>
            旋转装置，拍下五张投影数字照片。第五张照片完成后将自动进入密码界面。
          </p>
        </div>
        <div className="projection-frame">
          <iframe src="/vector-puzzle.html" title="投影解谜游戏" />
        </div>
      </div>
    );
  return (
    <div className="lock-screen phone-keypad-screen">
      <div className="screen-intro">
        <span>FINAL ROOM / PHONE PASSCODE</span>
        <h2>密室终局</h2>
        <p>五张投影照片已记录。请按照片顺序在九键手机上输入五位密码。</p>
      </div>
      {projectionPhotos.length > 0 && (
        <div className="keypad-photo-strip" aria-label="刚刚拍下的五张投影照片">
          {projectionPhotos.map((photo, index) => (
            <figure key={index}>
              <img src={photo} alt={`第 ${index + 1} 张投影照片`} />
              <figcaption>{index + 1}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <div className="code-dots">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className={code[i] ? "filled" : ""}>
            {code[i] || ""}
          </i>
        ))}
      </div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "清除", 0, "⌫"].map((key) => (
          <button key={key} onClick={() => pressKey(String(key))}>
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
