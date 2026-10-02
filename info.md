# 个人简历 / Creative Resume

界面和对话语言由用户 query 决定。此模板内置中英文，导航可切换；默认语言在 src/locale.ts。

## 使用前
询问：是否需要后端来管理作品/持久化联系请求？姓名、职位、真实经历和项目是什么？配色和视觉标本要保留吗？用户不回答就加载默认模板，不反复追问。只想预览时直接运行，不必改造。

全部默认人物、机构和项目背景均为虚构示例，联系方式为 example.com 占位。替换为用户自己的内容后再决定是否移除示例声明，不可把默认履历当作真实资历。当前是静态网站，没有远程模型、邮件、数据库或投递功能。

## 功能与文件
- src/content.ts：两套完整文案、履历与项目案例
- src/App.tsx：作品筛选、原生 dialog、语言切换、联系与下载
- src/Sculpture.tsx：原创动态参数曲面，点击切形、左右键旋转、暂停/重置
- src/model.ts：筛选、完整文本简历与几何函数
- src/ProjectArt.tsx：原创代码绘制的项目封面与可操作 mock UI，不是 AI 生图；封面无交互，详情含三个交互切片
- src/demo-model.ts：命令检索/键盘选择与受限 Markdown 解析；tests/demo.test.ts 覆盖边界
- src/project-art.css：三个产品界面的响应式样式
- src/styles.css：响应式、字体、减少动态、打印排版
- public/fonts：Geist / Noto Sans SC 与 OFL 许可证
- tests/model.test.ts：内容一致性、筛选、文本导出、几何单测

npm install 后，npm run dev 启动；npm test、npm run check、npm run build 验证。dist 可独立托管。每个语言目录都是自足项目。

## 可改方向
工程师求职、设计师作品集、自由职业主页、研究者个人站。替换项目时同时修改摘要、职责、决策和交付边界，不只替换封面。简历下载生成真实 UTF-8 .txt；打印按钮调用浏览器打印，可另存 PDF，不伪装已生成 PDF。

## 项目参考与实现边界（revision 02）
- Cutroom：参考 Alyssa X 的 Screenity（https://screenity.io/）。此处仅实现三个示例帧/备注切换与邮箱遮罩预览，不录制、转码、上传或分享。
- Wayfinder：参考 Paco Coursey 的 cmdk（原站现重定向 https://github.com/dip/cmdk）。独立实现小数据集搜索、方向键/Enter、空态和禁用原因；未引入 cmdk，也不宣称真实读屏/IME 认证。UI 权限不是安全边界。
- Margin：参考 Anthony Fu 的 Slidev（https://sli.dev/guide/why）。只解析标题/正文/列表，React 以文本渲染；会话内编辑、逐步展示、恢复样例，无云保存或导出。
- 每个详情页保留研究参考和明确的虚构说明，不将开源作者的产品、用户量或成绩归给示例候选人。没有搬运参考网站的品牌或素材。

## 技术
React + TypeScript + Vite。Canvas 2D 对参数曲面做三维投影和深度排序，设备像素比封顶2；离屏不重绘。系统减少动态时初始暂停，变化时也暂停。原生 dialog 提供焦点限制/Esc/关闭后焦点返回；背景滚动在详情打开时锁定。复制邮箱失败提供可手动复制地址。所有资源本地化，无外部字体服务。打包时保留字体许可证。
