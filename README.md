# Chumu (初慕) — Calendar Booking Mini Program

A premium calendar booking WeChat Mini Program for personal service appointment management. Supports dual themes: "Peach" (warm pink, default) and "Ink Gold" (dark luxury).

## Features

- **Monthly calendar** with date markers, tap date to view daily schedule
- **Smart time blocks** — consecutive free slots merged, overlapping bookings shown side-by-side (Google Calendar style)
- **Booking management** with status filters (all / pending / confirmed / cancelled)
- **Service type picker** — customizable services with name, color, and estimated duration; auto-calculates end time
- **Business hours** configuration with adjustable time intervals
- **Theme switcher** — Peach (feminine pink) and Ink Gold (dark luxury) themes
- **Cloud Database** — WeChat Cloud Development with local fallback

## Tech Stack

- Taro 4.1.11 + React + TypeScript + Sass
- WeChat Cloud Development (Cloud Database)
- WeChat Mini Program platform

## Quick Start

```bash
# Install dependencies
npm install

# Dev build (watch mode)
npm run dev:weapp

# Production build
npm run build:weapp
```

Open the project in WeChat DevTools, point to the `dist/` folder.

## Project Structure

```
src/
├── components/     # Calendar, TimeAxis, ActionSheet, BookingCard, etc.
├── hooks/          # useSettings, useServices, useBookings, useTheme, etc.
├── pages/
│   ├── calendar/   # Monthly calendar + time block view
│   ├── bookings/   # Booking list + add booking form
│   └── settings/   # Services, business hours, theme switcher
├── types/          # TypeScript interfaces
└── utils/          # Cloud DB, time helpers, themes, version
```

## Cloud Database Collections

Create these 4 collections after enabling Cloud Development:

| Collection | Purpose |
|------------|---------|
| `settings` | Business hours, time slot interval |
| `services` | Service types (name, color, duration) |
| `bookings` | Appointment records |
| `blocked_slots` | Blocked time periods |

## Roadmap

- [x] MVP: Calendar, bookings, settings, cloud DB
- [x] Smart time blocks with overlap detection
- [x] Theme switcher (Peach / Ink Gold)
- [x] Service type picker with auto duration
- [ ] v1.0: Public booking (WeChat login + conflict detection)
- [ ] v1.0: Booking approval workflow
- [ ] v1.0: Subscription message notifications

---

# 初慕 — 日历预约小程序

个人服务预约管理微信小程序，支持「蜜桃」和「墨金」双主题切换。

## 功能

- **月视图日历**，日期标记预约和屏蔽，点击查看当天日程
- **智能时间块**，连续空闲合并显示，重叠预约并排展示（类 Google 日历）
- **预约管理**，状态筛选（全部 / 待确认 / 已确认 / 已取消）
- **服务类型选择器**，自定义服务名称、颜色、预计时长；选择后自动计算结束时间
- **营业时间**，可调整开始/结束时间和时间间隔
- **主题切换**，蜜桃（少女粉，默认）和墨金（暗黑奢华）
- **云数据库**，微信云开发对接，未配置时本地 fallback

## 技术栈

- Taro 4.1.11 + React + TypeScript + Sass
- 微信云开发（云数据库）
- 微信小程序平台

## 快速开始

```bash
# 安装依赖
npm install

# 开发构建（监听模式）
npm run dev:weapp

# 生产构建
npm run build:weapp
```

用微信开发者工具打开项目，指向 `dist/` 目录。

## 云数据库集合

开通云开发后，创建以下 4 个集合：

| 集合 | 用途 |
|------|------|
| `settings` | 营业时间、时间间隔配置 |
| `services` | 服务类型（名称、颜色、预计时长） |
| `bookings` | 预约记录 |
| `blocked_slots` | 屏蔽时段 |

## 开发计划

- [x] MVP：日历、预约、设置、云数据库
- [x] 智能时间块 + 重叠检测
- [x] 主题切换（蜜桃 / 墨金）
- [x] 服务类型选择器 + 自动时长
- [ ] v1.0：开放预约（微信登录 + 冲突检测）
- [ ] v1.0：预约审批流程
- [ ] v1.0：订阅消息通知
