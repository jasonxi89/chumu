# Chumu (初慕) — Calendar Booking Mini Program

A premium calendar booking WeChat Mini Program for personal service appointment management. Built with a "Warm Noir" dark theme featuring amber gold accents.

## Features

- **Monthly calendar** with date markers for bookings and blocked slots
- **Time axis view** for each day's schedule with slot management
- **Booking management** with status filters (all / pending / confirmed / cancelled)
- **Service types** with customizable names, colors, and duration options
- **Business hours** configuration with adjustable time intervals
- **Cloud-ready** with WeChat Cloud Database integration (mock data fallback)

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
├── hooks/          # useSettings, useServices, useBookings, useCalendarData
├── pages/
│   ├── calendar/   # Main calendar + time axis page
│   ├── bookings/   # Booking list + add booking form
│   └── settings/   # Service types + business hours config
├── types/          # TypeScript interfaces
└── utils/          # Cloud DB helpers, time utilities
```

## Cloud Database Collections

Create these 4 collections after enabling Cloud Development:

| Collection | Purpose |
|------------|---------|
| `settings` | Business hours, time slot interval |
| `services` | Service types (name, color, durations) |
| `bookings` | Appointment records |
| `blocked_slots` | Blocked time periods |

## Roadmap

- [x] MVP: Owner calendar management
- [ ] v1.0: Public booking (WeChat login + conflict detection)
- [ ] v1.0: Booking approval workflow
- [ ] v1.0: Subscription message notifications

---

# 初慕 — 日历预约小程序

个人服务预约管理微信小程序，采用「暖黑」深色主题 + 琥珀金点缀，质感高级。

## 功能

- **月视图日历**，日期标记预约和屏蔽时段
- **时间轴视图**，查看每天日程，管理时段
- **预约管理**，状态筛选（全部 / 待确认 / 已确认 / 已取消）
- **服务类型**，自定义名称、颜色、时长选项
- **营业时间**，可调整开始/结束时间和时间间隔
- **云端就绪**，对接微信云数据库（未配置时自动使用本地数据）

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
| `services` | 服务类型（名称、颜色、时长） |
| `bookings` | 预约记录 |
| `blocked_slots` | 屏蔽时段 |

## 开发计划

- [x] MVP：自用日历管理
- [ ] v1.0：开放预约（微信登录 + 冲突检测）
- [ ] v1.0：预约审批流程
- [ ] v1.0：订阅消息通知
