# 初慕 - 日历预约小程序 MVP 设计

## 概述

服务预约类微信小程序。MVP 版本供自己管理日历和查看预约，1.0 版本开放给他人预约。

## 技术栈

- **前端**: Taro + React + TypeScript + Sass
- **后端**: 微信云开发（云数据库，MVP 不用云函数）
- **部署**: 微信小程序

## MVP 功能范围

### 包含
- 月视图日历，日期标记有预约/屏蔽
- 点击日期展开当天时间轴
- 屏蔽时段（默认全天可约，标记不可用时段）
- 服务类型管理（名称、可选时长、颜色）
- 预约列表查看（按日期分组，状态筛选）
- 营业时间设置

### 不包含（1.0）
- 微信登录 + 他人预约流程
- 预约冲突检测
- 预约审批（接受/拒绝）
- 订阅消息推送

### 不做（YAGNI）
- 支付、评价、多管理员、重复预约规则、日历同步

## 数据模型（云数据库）

### services
```json
{
  "_id": "auto",
  "name": "string",
  "duration_options": [30, 60, 90],
  "color": "#hex",
  "is_active": true,
  "created_at": "date"
}
```

### blocked_slots
```json
{
  "_id": "auto",
  "date": "2026-03-07",
  "start_time": "14:00",
  "end_time": "15:00",
  "reason": "string?",
  "created_at": "date"
}
```

### bookings
```json
{
  "_id": "auto",
  "date": "2026-03-07",
  "start_time": "10:00",
  "end_time": "11:00",
  "duration": 60,
  "service_type": "service_id",
  "customer_name": "string",
  "customer_phone": "string",
  "customer_wechat": "string",
  "notes": "string?",
  "status": "pending | confirmed | cancelled",
  "openid": "string",
  "created_at": "date"
}
```

### settings
```json
{
  "_id": "auto",
  "owner_openid": "string",
  "business_hours": { "start": "09:00", "end": "18:00" },
  "time_slot_interval": 30
}
```

## 页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页（日历） | /pages/index/index | 月视图 + 点击展开当天时间轴 |
| 预约列表 | /pages/bookings/index | 按日期分组，状态筛选 |
| 设置 | /pages/settings/index | 服务类型管理、营业时间 |

## UI 风格

- **风格**: 极简 + 大量留白，Cal.com / Calendly 质感
- **色调**: 深色主色（藏青/墨黑）+ 亮色点缀（薄荷绿或珊瑚橙）
- **日历**: 圆角卡片式，选中日期渐变高亮
- **交互**: 滑动屏蔽时段，流畅动画过渡
- **字体**: 大标题加粗，层次分明
