# Boxhawk MVP — Web App Design Spec (v0.1)

**Updated:** 2025-10-15 03:39 UTC

This document consolidates the agreed MVP scope for the Boxhawk volunteer system (web-first, mobile-friendly).  
Language: the **UI strings and code comments should be in English**; this document itself mixes English headers + Chinese explanations for clarity.

---

## 1. Goals & Scope

- 以最小可行产品（MVP）上线：**邮箱登录**、**角色权限**、**上传/拍照**、**列表浏览**、**专家信息录入（含 OCR 辅助）**、**成功反馈页**。
- 面向两类主要志愿者：
  - **PhotoUser**：大量“拍照/上传物品图片”。
  - **Expert**：基于图片与 OCR 文本**人工整理结构化信息**。
- 后端采用 **Supabase（Postgres + Auth + Storage + Edge Functions）**；前端采用 **Next.js (App Router)**。
- 图片规模目标：**10万+**；数据库仅存**元数据**，图片放对象存储（CDN）。
- 预算与人力：单人快速交付，后续小团队维护，强调“低成本、低运维”。

---

## 2. Roles & Permissions (RBAC)

- **SuperAdmin**：平台最高权限；用户与角色管理、所有数据读写。
- **Admin**：与 SuperAdmin 接近，但无危险运维操作（可按需缩限）。
- **PhotoUser**：创建 item、上传/查看与自己相关的图片与条目。
- **Expert**：查看“待处理/已存储”的条目，**编辑结构化表单**并提交完成。

**实现要点**  
- 角色保存在 `auth.users.app_metadata.role` 中；RLS 策略通过 `auth.jwt()` 读取并判定。
- Storage 使用**私有桶**，前端通过**签名 URL**访问；上传通过 SDK 或签名上传 URL。

---

## 3. Architecture

- **Frontend**: Next.js (App Router) + React；仅少量客户端组件（上传、相机、交互）。
- **Backend (BaaS)**: Supabase
  - Postgres（RLS、扩展）；
  - Auth（Email/Password，后续再接入 Google/Apple）；
  - Storage（对象存储 + CDN）；
  - Edge Functions（Deno/TypeScript，用于 OCR 安全调用）。
- **Deployment**: 前端部署到 Vercel（或 Supabase 托管）；数据库/存储/函数由 Supabase 托管。

---

## 4. Routes & Pages

```
/login                     – Login (Email/Password; OAuth later)
/                          – Home (role-based cards)
/photo/upload              – PhotoUser uploader (camera/drag&drop, min 4 photos)
/success                   – Success screen
/items                     – Expert list (stock list & filters)
/items/[id]                – Expert review form (left: images, right: OCR + form)
/admin/users               – User & role management (Admin/SuperAdmin)
```

### 4.1 `/login`
- Supabase Auth UI 组件（已接入）；登录后按角色跳转：
  - PhotoUser → `/photo/upload`
  - Expert/Admin/SuperAdmin → `/items` 或 `/`
- 后续接入 Google/Apple（待确认组织账号）。

### 4.2 `/` (Home)
- **PhotoUser**：显示 `Scan new` 卡片 → `/photo/upload`；完成后进入 `/success`，再返回 Home。

- **Expert**：显示 `Review photos` 卡片 → `/items`（默认“待处理/分配给我”）。

- **Admin/SuperAdmin**：增加 `Manage users` 卡片 → `/admin/users`。

  ![image-20251015144304158](boxhawk-mvp-design.assets/image-20251015144304158.png)

### 4.3 `/photo/upload`
- 移动端 `<input type="file" accept="image/*" capture="environment" multiple>` 调用后摄像头；桌面端拖拽/选择。
- 最少 4 张图片，最多10张图片（提示用户拍摄不同侧面）；上传至 **Storage 私有桶**；数据库仅存 `bucket+path`（不存完整 URL）。
- 写入 `staging_samples`（或直接写 `items` + `images`）；状态标记为 `uploaded`。
- 成功后跳转 `/success`。

![image-20251015144347908](boxhawk-mvp-design.assets/image-20251015144347908.png)

![image-20251015144415318](boxhawk-mvp-design.assets/image-20251015144415318.png)

### 4.4 `/success`

- 静态成功反馈 + “Back to Home / Continue scanning” 按钮。

![image-20251015144434130](boxhawk-mvp-design.assets/image-20251015144434130.png)

### 4.5 `/items`（Expert 列表页 / Stocklist）
- 展示字段：缩略图、name、manufacturer、status（uploaded/in_review/complete）、created_at、assigned_to。
- 支持搜索与筛选：name/manufacturer/ref/lot/barcode/gtin 模糊查询；分页。

### 4.6 `/items/[id]`（Expert 信息收集）
**左侧**：图片序列（缩略图 + 大图预览），切换图片时**右上 OCR Raw**随之切换。  
**右侧上**：`OCR Raw text`（只读，可复制）。  
**右侧下**：结构化表单（建议原生表单直写数据库；如坚持 Google Form 可 iframe，但一致性与跨域较难）。  
动作：`Save`（部分保存） / `Mark as Complete`（状态改为 `complete`）。

![image-20251015144511170](boxhawk-mvp-design.assets/image-20251015144511170.png)

后面还需要Review和double check信息

![image-20251015144528739](boxhawk-mvp-design.assets/image-20251015144528739.png)

### 4.7 `/admin/users`
- 管理用户与角色（设置 `app_metadata.role`）。
- 仅 Admin/SuperAdmin 可见。

---

## 5. Data Model (current + tweaks)

**现有表（你已实现）**  
- `staging_samples`（缓冲/幂等导入，字段含 image_1..image_3 等；可扩展 N 张）  
- `items`（主表，结构化字段：name、manufacturer、size、barcode、gtin、lot、ref、date_of_manufacture、expiration、quantity、notes、status 等）  
- `images`（item_id + bucket + path + meta）  
- `symbols` / `item_symbols`（可选：标签/回收标识等多对多）

**补充建议**  
- 所有表加 `created_at timestamptz default now()`、`updated_at timestamptz`（触发器自动刷新）。  
- `images` 仅存 `bucket + path`；访问时生成 public/signed URL。  
- 为 `items` 的 name/manufacturer/ref/lot/barcode/gtin 建立 `pg_trgm` GIN 索引以支持模糊搜索；若需要全文检索，新增 `ocr_text` + 生成列 `search_tsv tsvector` + GIN。  
- `staging_samples` 通过 `form_response_id UNIQUE` 保证导入幂等；用 Cron 定期清理 30 天前数据。

---

## 6. OCR Pipeline

- 建立 **Edge Function** `ocr-extract`（Deno/TypeScript），持有第三方 OCR 服务密钥。  
- 输入：`item_id` 或一组 `images.bucket+path`；服务端获取签名 URL → 调用 OCR → 回写 `items.ocr_text`（或 `ocr_results` 子表）并记录来源与耗时。  
- 前端在 `/items/[id]` 点击 **Extract OCR** 按钮触发；或在上传完成后自动触发。

---

## 7. RBAC & RLS（摘要）

- **profiles**：`id uuid (auth.users)`, `role ('superadmin'|'admin'|'photouser'|'expert')`（或直接用 `app_metadata.role`）。
- **items**：
  - SELECT：已登录用户可见；细化为 *Expert 可见分配给自己或待处理*；PhotoUser 仅见自己创建的；Admin/SuperAdmin 全量。
  - INSERT：PhotoUser/管理员；`created_by = auth.uid()`。
  - UPDATE：Expert（被分配或待处理）、创建者、管理员。
- **images**：
  - SELECT：与对应 item 的可见性一致。
  - INSERT：需具备该 item 的写权限。
- **Storage（私有桶）**：INSERT 允许 PhotoUser/管理员；SELECT 通过 RLS 或签名 URL。

---

## 8. Search & Performance

- 10 万级条目：优先使用索引（`pg_trgm`、`tsvector`）；分页 `limit/offset` 或基于游标。  
- 图片：对象存储 + CDN；数据库仅存路径/尺寸元信息；私有访问用 **signed URL**。

---

## 9. Implementation Order (MVP)

1) 路由壳：`/login` → `/` → `/photo/upload` → `/success`。  
2) Storage 私有桶 + 前端上传（进度/失败重传）+ 写 `staging_samples`。  
3) `/items` 列表（筛选/分页） + `/items/[id]` 骨架（左图右表）。  
4) OCR Edge Function + 前端触发 + 写回 & 刷新。  
5) RBAC：角色写入 `app_metadata.role`，完善 RLS；Home 按角色显示不同卡片。  
6) 搜索索引（`pg_trgm` / `tsvector`）与基础监控。

---

## 10. Acceptance Checklist

- [ ] Email/Password 登录；按角色跳转 Home。  
- [ ] PhotoUser 可上传 最少4 张图片，最多10张图片；成功页反馈。  
- [ ] Expert 可在 `/items` 看到待处理列表，并进入 `/items/[id]` 完成表单。  
- [ ] OCR 按钮可提取并展示 Raw 文本；可复制粘贴到表单。  
- [ ] `Save` 与 `Mark as Complete` 正常写库并更新状态。  
- [ ] RLS 生效：不同角色只看到/操作允许的数据。  
- [ ] 10k+ 数据分页/搜索响应稳定。

---

## 11. Future Backlog (post-MVP)

- 社交登录（Google/Apple）；
- 批量上传与离线缓存；
- 审核流/多人协作（锁定/分配）；
- 更丰富的图片注释与对比视图；
- 自动从 OCR 解析结构化字段（规则/模型）；
- 审计日志与导出报表；
- 移动 App 外壳（PWA/Capacitor/React Native）。

---

## Appendix (Quick Notes)

- 使用 **Next.js App Router** 组织页面与布局（`app/` 目录）；客户端组件用于上传/相机等交互。  
- Supabase JS `createClient` 初始化于 `lib/supabaseClient.js`；Edge Functions 用 `supabase.functions.invoke()` 调用；Storage 用 `upload()` / `createSignedUrl()`。
