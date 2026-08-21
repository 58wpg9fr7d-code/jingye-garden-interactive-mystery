# Verification

## 2026-08-21 本地与线上核查

- [x] 找到原始项目材料：世界观、案件、角色本、设计评审、视觉素材
- [x] 恢复侦探卷宗静态页面
- [x] 恢复线索卡抽卡静态页面
- [x] 页面代码未发现外部 API Key 或个人隐私依赖
- [x] GitHub Pages 静态 MVP 可访问：`https://58wpg9fr7d-code.github.io/jingye-garden-interactive-mystery/` 返回 200
- [ ] Railway `/phone` 全量应用可访问：本次访问超时
- [x] 找到并核对完整手机端源码：`完整手机端源码/`
- [x] 新版本地 `npm run build` 通过，包含 `/`、`/phone`、`/puzzle` 三路
- [x] Vercel 三个入口返回 200
- [x] 更新渲染测试，测试产品页面而非已移除的 starter skeleton
- [x] GitHub 仓库与 Pages：已创建、公开推送并发布

## 本地验证命令

```bash
python3 -m http.server 8000
curl --noproxy '*' -I http://127.0.0.1:8000/
curl --noproxy '*' -I http://127.0.0.1:8000/web/detective-case.html
curl --noproxy '*' -I http://127.0.0.1:8000/web/clue-cards.html
```

## 结论

当前主 Demo 是 Vercel 上的 ScriptLab 工作台和手机端剧情体验；GitHub Pages 是静态备份。当前交互主要是前端演示逻辑，规则式角色回复不等于真实大模型，手机端也不等于已实现实时多人后端。历史 Railway 地址仍不作为主 Demo。
