# TaskForge

A clean, fast task manager built with React Native + Expo. Organise work into colour-coded projects, drop tasks into a three-column kanban board, track subtasks, and never miss a deadline.

---

## Features

- **Projects** — create, rename, recolour, and delete projects. Long-press a project on the dashboard for the menu, or swipe left on a project card for quick delete.
- **Kanban board** — every project has a *To do / In progress / Done* board. Swipe a task left to change its status or delete it.
- **Tasks** — add, edit (title, description, status, priority, due date), complete, and delete tasks. Each task can hold any number of subtasks with independent completion state.
- **Dashboard** — at-a-glance overview with:
  - A "today" card showing tasks due today and overdue counts
  - Tappable *In progress* and *Completed %* stat cards that open a focused task list
  - A bell icon with a badge for tasks overdue or due within the next hour
  - Sections for *Today*, *High priority*, and all projects
- **Deep search** — the search box on the dashboard matches against project names, task titles, task descriptions, **and** subtask titles.
- **Theming** — Light / System / Dark theme with a deep-black dark mode and orange/lime/teal accents, switchable from Settings.
- **Persistence** — all data is stored locally on device with MMKV (synchronous, encrypted-capable storage). No login or network needed.
- **Undo/redo bus** — every write goes through an in-memory command bus, so history is recorded for future undo support.

## Architecture

The codebase follows a small, layered hexagonal architecture so the UI stays thin and the rules are testable:

```
src/
├── app/                 Expo Router screens (file-based routing)
│   ├── (tabs)/          Tab navigator: index (dashboard), settings
│   ├── project/[id]     Project detail / kanban board
│   └── task/[id]        Task detail / edit screen
├── domain/              Pure TypeScript — no React, no I/O
│   ├── entities/        Task, Project, Subtask, Settings
│   ├── value-objects/   TaskStatus, TaskPriority
│   ├── ports/           Interfaces (Repository, Clock, IdGenerator, HistoryBus)
│   └── use-cases/       CreateTask, UpdateTaskDetails, ChangeTaskStatus, …
├── data/                Adapters that implement the domain ports
│   ├── persistence/     MMKV-backed repositories + Zod schemas
│   ├── history/         In-memory command bus
│   └── system/          SystemClock, UuidV7Generator
├── presentation/        React Native UI
│   ├── components/      KanbanColumn, TaskCard, DueDateStrip, …
│   ├── hooks/           useTask, useProjects, useTaskActions, …
│   └── theme/           Tokens + ThemeProvider (bridges Paper's MD3 theme)
└── composition-root.ts  Wires every use case to its concrete adapters
```

A use case never imports React or MMKV directly — it only knows the port interfaces, which makes the rules trivial to swap or test.

---

## Setup

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm** (or your preferred package manager)
- One of:
  - **Expo Go** on a physical device (iOS or Android), or
  - **Android Studio** with an emulator, or
  - **Xcode** with a simulator (macOS only)

### Install

```bash
npm install
```

### Run

```bash
npm run start          # opens the Expo dev server, scan the QR with Expo Go
npm run android        # launches on a connected Android device/emulator
npm run ios            # launches on an iOS simulator (macOS only)
npm run web            # runs in the browser (most features work)
```

The app uses `react-native-mmkv`, which is a native module. **It will not run inside Expo Go.** You must use a development build:

```bash
npx expo prebuild
npx expo run:android   # or run:ios
```

If you only want to play with the dashboard / theming / navigation, the web target works without a native build.

---

## Third-party libraries

| Library | Why it's used |
|---|---|
| **expo** / **expo-router** | App framework + file-based routing for the screen tree. |
| **react-native-paper** | Material 3 component library — `TextInput`, `Dialog`, `Button`, `Switch`, `ProgressBar`, `Checkbox`. |
| **react-native-reanimated** | High-performance animations; powers the staggered `FadeInDown` entrances on cards and sections. |
| **react-native-gesture-handler** | Native gesture recognition; powers the swipe-to-delete row on projects and tasks. |
| **react-native-safe-area-context** | Reliable safe-area insets on notched devices. |
| **react-native-screens** | Native navigation primitives used by Expo Router. |
| **@expo/vector-icons** (Ionicons) | Icon set used throughout the UI. |
| **react-native-mmkv** | Synchronous, fast key-value storage backing every repository. |
| **zustand** | Tiny store used to expose repository state to React; the screens subscribe with selectors. |
| **zod** | Schema validation for everything read out of MMKV — guards against corrupted or out-of-version data. |
| **uuid** / **expo-crypto** | UUID v7 generation for entity IDs (sortable, time-ordered). |
| **date-fns** | Lightweight date helpers. |
| **react-native-worklets** | Required runtime for Reanimated v4 worklets. |

Dev-only:

| Library | Why |
|---|---|
| **typescript** | Strict-mode TS across the project. |
| **vitest** | Unit tests for the pure domain layer (use cases, entities, value objects). |
| **@testing-library/react-native** | Reserved for future component tests. |

---

## Submission checklist

- [x] Add tasks, mark them complete, and delete them
- [x] Persist data between launches (MMKV)
- [x] Clean, layered architecture (domain / data / presentation)
- [x] Theming with light + dark support
- [x] Polished UI with animations, swipe actions, and an at-a-glance dashboard
- [x] README covering setup, features, and dependencies

---

## License

Private project, all rights reserved.
