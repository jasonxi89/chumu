# 初慕 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a calendar booking mini program MVP where the owner can view a calendar, block off time slots, manage service types, and view bookings.

**Architecture:** Taro + React + TypeScript + Sass, WeChat Cloud Development (cloud database, no cloud functions for MVP). Pure frontend CRUD against cloud DB. Single-user (owner) mode for MVP.

**Tech Stack:** Taro 4.x, React, TypeScript, Sass, WeChat Cloud Database

---

### Task 1: Project Scaffolding

**Files:**
- Create: all project config files (package.json, tsconfig.json, project.config.json, etc.)
- Create: `src/app.ts`, `src/app.config.ts`, `src/app.scss`
- Create: `src/utils/cloud.ts` (cloud init helper)
- Create: `src/types/index.ts` (all data types)

**Step 1: Initialize Taro project**

```bash
cd ~/WeChatProjects/chumu
npx @tarojs/cli@latest init --name chumu --description "初慕 - 日历预约" --typescript --css sass --framework react --compiler webpack5
```

If taro cli prompts, select: React + TypeScript + Sass + webpack5 + default template.

**Step 2: Configure project.config.json**

Set appid (use test appid or the user's appid), enable cloud development:

```json
{
  "miniprogramRoot": "dist/",
  "projectname": "chumu",
  "description": "初慕 - 日历预约",
  "appid": "待定",
  "cloudfunctionRoot": "",
  "setting": {
    "urlCheck": false,
    "es6": false,
    "enhance": false,
    "compileHotReLoad": false,
    "postcss": false,
    "minified": false
  },
  "compileType": "miniprogram",
  "srcMiniprogramRoot": "dist/",
  "cloudbaseRoot": ""
}
```

**Step 3: Create type definitions**

`src/types/index.ts`:

```typescript
export interface Service {
  _id?: string
  name: string
  duration_options: number[]
  color: string
  is_active: boolean
  created_at: Date
}

export interface BlockedSlot {
  _id?: string
  date: string          // 'YYYY-MM-DD'
  start_time: string    // 'HH:mm'
  end_time: string      // 'HH:mm'
  reason?: string
  created_at: Date
}

export interface Booking {
  _id?: string
  date: string          // 'YYYY-MM-DD'
  start_time: string    // 'HH:mm'
  end_time: string      // 'HH:mm'
  duration: number      // minutes
  service_type: string  // service _id
  service_name: string
  customer_name: string
  customer_phone: string
  customer_wechat: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  openid: string
  created_at: Date
}

export interface Settings {
  _id?: string
  owner_openid: string
  business_hours: {
    start: string       // 'HH:mm'
    end: string         // 'HH:mm'
  }
  time_slot_interval: number  // minutes
}

export interface TimeSlot {
  time: string          // 'HH:mm'
  status: 'available' | 'blocked' | 'booked'
  booking?: Booking
  blocked?: BlockedSlot
}
```

**Step 4: Create cloud init utility**

`src/utils/cloud.ts`:

```typescript
import Taro from '@tarojs/taro'

let initialized = false

export function initCloud() {
  if (initialized) return
  if (Taro.cloud) {
    Taro.cloud.init({ traceUser: true })
    initialized = true
  }
}

export function getDB() {
  initCloud()
  return Taro.cloud.database()
}
```

**Step 5: Configure app entry with cloud init**

`src/app.config.ts`:

```typescript
export default defineAppConfig({
  pages: [
    'pages/calendar/index',
    'pages/bookings/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '初慕',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#34d399',
    backgroundColor: '#0f172a',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/calendar/index', text: '日历', iconPath: 'assets/icons/calendar.png', selectedIconPath: 'assets/icons/calendar-active.png' },
      { pagePath: 'pages/bookings/index', text: '预约', iconPath: 'assets/icons/list.png', selectedIconPath: 'assets/icons/list-active.png' },
      { pagePath: 'pages/settings/index', text: '设置', iconPath: 'assets/icons/settings.png', selectedIconPath: 'assets/icons/settings-active.png' },
    ],
  },
  cloud: true,
})
```

`src/app.ts`:

```typescript
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initCloud } from './utils/cloud'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    initCloud()
  })
  return children
}

export default App
```

**Step 6: Create global styles with design tokens**

`src/app.scss`:

```scss
// Design Tokens
:root {
  --color-bg: #0f172a;
  --color-bg-card: #1e293b;
  --color-bg-elevated: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-accent: #34d399;
  --color-accent-light: rgba(52, 211, 153, 0.15);
  --color-warning: #fb923c;
  --color-danger: #f87171;
  --color-border: #334155;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
}

page {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Step 7: Create tabbar icon assets**

Create simple SVG-based PNG icons (81x81px) for the 3 tabs: calendar, list, settings. Both normal and active states (6 icons total).

Place in `src/assets/icons/`.

**Step 8: Git init and commit**

```bash
cd ~/WeChatProjects/chumu
git init
echo "node_modules/\ndist/\n.DS_Store\n*.log" > .gitignore
git add -A
git commit -m "feat: init chumu project with Taro + cloud development"
```

---

### Task 2: Design System & Shared Components

**Files:**
- Create: `src/components/Calendar/index.tsx` + `index.scss`
- Create: `src/components/TimeAxis/index.tsx` + `index.scss`
- Create: `src/components/SlotCard/index.tsx` + `index.scss`
- Create: `src/components/ActionSheet/index.tsx` + `index.scss`
- Create: `src/components/EmptyState/index.tsx` + `index.scss`

**Step 1: Calendar component**

Monthly calendar grid. Props: `selectedDate`, `onDateSelect`, `markedDates` (map of date -> dot colors).

Features:
- Swipe left/right to change month
- Selected date has gradient highlight (accent color glow)
- Marked dates show colored dots below the number
- Today has a subtle ring
- Smooth month transition animation

```typescript
interface CalendarProps {
  selectedDate: string                    // 'YYYY-MM-DD'
  onDateSelect: (date: string) => void
  markedDates: Record<string, string[]>   // date -> array of dot colors
}
```

**Step 2: TimeAxis component**

Vertical timeline for a single day. Shows time slots from business hours start to end, at interval increments.

Props: `date`, `slots: TimeSlot[]`, `onSlotTap`, `onSlotLongPress`

Visual style:
- Left side: time labels (09:00, 09:30, ...)
- Right side: slot cards or empty space
- Blocked slots: diagonal stripes pattern, muted color
- Booked slots: accent color card with customer name preview
- Available slots: subtle dashed border, tap to block

**Step 3: SlotCard component**

Individual time slot card used in TimeAxis. Shows status icon, time range, and brief info.

**Step 4: ActionSheet component**

Bottom sheet for actions (block slot, view details, etc.). Smooth slide-up animation.

**Step 5: EmptyState component**

Illustration + message for empty lists. Reusable across pages.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add shared UI components (Calendar, TimeAxis, SlotCard)"
```

---

### Task 3: Calendar Page (首页)

**Files:**
- Create: `src/pages/calendar/index.tsx` + `index.scss`
- Create: `src/hooks/useCalendarData.ts`
- Create: `src/utils/time.ts` (time slot generation utilities)

**Step 1: Time utility functions**

`src/utils/time.ts`:

```typescript
// generateTimeSlots(startTime, endTime, interval) -> string[]
// e.g. generateTimeSlots('09:00', '18:00', 30) -> ['09:00', '09:30', '10:00', ...]

// addMinutes(time: string, minutes: number) -> string
// e.g. addMinutes('09:00', 30) -> '09:30'

// isTimeInRange(time, start, end) -> boolean

// formatDate(date: Date) -> string  ('YYYY-MM-DD')
// formatMonth(date: Date) -> string ('YYYY年MM月')
// getDaysInMonth(year, month) -> number
// getFirstDayOfMonth(year, month) -> number (0=Sun)
```

**Step 2: useCalendarData hook**

Fetches blocked_slots and bookings for the selected month from cloud DB. Returns:
- `markedDates`: for calendar dots
- `daySlots`: computed TimeSlot[] for selected date
- `loading`: boolean
- `refresh`: function

**Step 3: Calendar page**

Layout:
- Top: month/year header with left/right arrows
- Middle: Calendar component (takes ~40% height)
- Bottom: TimeAxis for selected date (scrollable)
- FAB button: "屏蔽时段" action

Interactions:
- Tap date → load that day's time axis
- Tap available slot → ActionSheet with "屏蔽此时段" option
- Tap blocked slot → ActionSheet with "取消屏蔽" option
- Tap booked slot → show booking details
- Long press slot → quick block/unblock

**Step 4: Implement block/unblock cloud DB operations**

```typescript
// blockSlot(date, startTime, endTime, reason?) -> add to blocked_slots collection
// unblockSlot(slotId) -> remove from blocked_slots collection
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add calendar page with time axis and slot management"
```

---

### Task 4: Bookings List Page

**Files:**
- Create: `src/pages/bookings/index.tsx` + `index.scss`
- Create: `src/hooks/useBookings.ts`
- Create: `src/components/BookingCard/index.tsx` + `index.scss`
- Create: `src/components/FilterTabs/index.tsx` + `index.scss`

**Step 1: FilterTabs component**

Horizontal pill tabs: 全部 | 待确认 | 已确认 | 已取消

Animated underline/pill that slides to selected tab.

**Step 2: BookingCard component**

Card showing:
- Date + time range (left, large)
- Service type color dot + name
- Customer name
- Status badge (colored pill)

Tap to expand → show full details (phone, wechat, notes)

**Step 3: useBookings hook**

Fetches bookings from cloud DB with pagination. Supports filter by status.

**Step 4: Bookings page**

Layout:
- Top: "预约列表" title
- FilterTabs
- Scrollable list of BookingCards, grouped by date
- Empty state when no bookings

MVP: bookings are created manually via a "添加预约" button (for testing). Opens a form sheet to add a booking manually.

**Step 5: Manual booking form**

Bottom sheet form with fields:
- 日期 (date picker)
- 时间 (time picker for start time)
- 时长 (duration selector from service's options)
- 服务类型 (picker from services list)
- 客户姓名
- 手机号
- 微信号
- 备注

Validates: required fields, time conflicts with blocked slots and existing bookings.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add bookings list page with filters and manual booking form"
```

---

### Task 5: Settings Page

**Files:**
- Create: `src/pages/settings/index.tsx` + `index.scss`
- Create: `src/components/ServiceItem/index.tsx` + `index.scss`
- Create: `src/components/TimePicker/index.tsx` + `index.scss`
- Create: `src/hooks/useSettings.ts`
- Create: `src/hooks/useServices.ts`

**Step 1: useSettings hook**

CRUD for settings collection. Auto-creates default settings on first load:
- business_hours: 09:00 - 18:00
- time_slot_interval: 30

**Step 2: useServices hook**

CRUD for services collection. Methods: list, add, update, toggle active, delete.

**Step 3: ServiceItem component**

Card showing service name, color dot, duration options, active toggle.

Swipe left to reveal delete button.

**Step 4: Settings page**

Layout sections:
- **营业时间**: start/end time pickers + interval selector (15/30/60 min)
- **服务类型**: list of ServiceItems + "添加服务" button
- Add service: inline form with name, color picker (preset palette), duration options (multi-select chips: 30/60/90/120 min)

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add settings page with service types and business hours"
```

---

### Task 6: Polish & Integration

**Files:**
- Modify: all pages and components for final styling
- Create: `src/utils/seed.ts` (dev helper to seed test data)

**Step 1: Seed test data utility**

For development: function to populate cloud DB with sample services, bookings, and blocked slots. Only runs in dev mode.

**Step 2: Cross-page data consistency**

Ensure settings changes (business hours, services) reflect immediately on calendar page when switching tabs.

**Step 3: Loading states and animations**

- Skeleton screens while loading data
- Smooth transitions between months
- Haptic feedback on block/unblock (wx.vibrateShort)
- Pull-to-refresh on bookings list

**Step 4: Edge cases**

- No services configured → prompt to add in settings
- Business hours changed → recalculate time slots
- Date with no slots → show "休息日" state

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: polish UI, add loading states and seed data utility"
```

---

## Task Dependencies

```
Task 1 (Scaffolding) ──→ Task 2 (Components) ──→ Task 3 (Calendar Page)
                                               ──→ Task 4 (Bookings Page)
                                               ──→ Task 5 (Settings Page)
                                                        ↓
                                               Task 6 (Polish)
```

**Parallelizable:** Tasks 3, 4, 5 can run in parallel after Task 2 is done.

## Agent Team Structure

| Agent | Task | Notes |
|-------|------|-------|
| Agent 1 | Task 1 + Task 2 | Foundation, must complete first |
| Agent 2 | Task 3 | Calendar page (depends on Task 2) |
| Agent 3 | Task 4 | Bookings page (depends on Task 2) |
| Agent 4 | Task 5 | Settings page (depends on Task 2) |
| Main | Task 6 | Polish after all pages done |
