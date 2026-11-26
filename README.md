# Team Workflow Board

A responsive task-management application built with React, TypeScript, Vite, and Tailwind CSS. It includes a reusable UI component library, a three-column workflow board, task filtering and sorting, and versioned browser storage.

Built as part of the Everquint frontend technical assessment.

## Features

- **Workflow board:** Organize tasks into Backlog, In Progress, and Done.
- **Task management:** Create and edit tasks with title, description, status, priority, assignee, and tags.
- **Status updates:** Move tasks between columns using a status dropdown.
- **Search and filters:** Search titles and descriptions; filter by multiple statuses and priority.
- **Sorting:** Sort tasks by creation date, update date, or priority.
- **URL synchronization:** Preserve filter and sorting selections in the query string.
- **Persistence:** Save tasks to localStorage using a versioned schema.
- **Data migration:** Upgrade supported older storage data to the current format.
- **User feedback:** Display validation errors, storage warnings, and toast notifications.
- **Reusable design system:** Button, TextInput, TextArea, Select, Badge, Card, Modal, and Toast.

### Drag-and-Drop Task Management

- Move tasks between Backlog, In Progress, and Done using React DnD.
- Dedicated drag handles prevent interference with card controls.
- Visual feedback identifies valid drop destinations.
- Dragged cards become partially transparent during movement.
- Same-column drops are rejected to prevent redundant updates.
- Cancelled drag operations preserve the original task state.
- Successful drops update task status, modification timestamps,
  column counts, and local storage.
- Success toast notifications provide immediate feedback.
- Existing status dropdowns remain available as an accessible
  alternative for keyboard and touch-device users.
- Active search, filtering, and sorting rules remain respected.


## Technology Stack

- React with TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Vitest
- React Testing Library
- jsdom
- Browser localStorage

## Getting Started

### Prerequisites

Install a Node.js version compatible with the project's dependencies and a supported npm version.

### Installation

From the repository root:

```bash
cd frontend/team-workflow-board
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Run automated tests

```bash
npm run test:run
```

The current automated suite contains eight passing tests covering task workflows and storage behavior.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

```text
src/
├── components/
│   └── ui/
│       ├── Button/
│       ├── TextInput/
│       ├── TextArea/
│       ├── Select/
│       ├── Badge/
│       ├── Card/
│       ├── Modal/
│       └── Toast/
├── data/
│   └── initialTasks.ts
├── features/
│   └── tasks/
│       └── components/
│           ├── TaskBoard.tsx
│           ├── TaskCard.tsx
│           ├── TaskForm.tsx
│           ├── TaskFiltersBar.tsx
│           └── TaskBoard.test.tsx
├── hooks/
│   ├── useTasks.ts
│   └── useTaskFilters.ts
├── types/
│   ├── task.ts
│   └── filters.ts
├── utils/
│   ├── taskStorage.ts
│   └── taskStorage.test.ts
└── App.tsx
```

## Architecture Overview

The application separates reusable presentation components from task-management logic.

- `TaskBoard` coordinates the board UI, dialogs, notifications, and task interactions.
- `useTasks` manages task state and persistence.
- `useTaskFilters` manages filter state and URL synchronization.
- `taskStorage.ts` handles storage validation, serialization, and migration.
- The reusable UI components provide consistent styling and interaction patterns.

React hooks and local component state were selected instead of an external state-management library because the application is relatively small and does not require complex global state sharing.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for further details.

## Testing

The automated suite covers:

1. Creating a task and displaying it in Backlog.
2. Moving a task between workflow statuses.
3. Filtering tasks by title.
4. Rejecting an empty task title.
5. Migrating version 1 task data to version 2.
6. Handling corrupted stored JSON.
7. Preserving an empty saved task list.
8. Rejecting unsupported storage schema versions.

Manual verification includes task editing, filters, sorting, modal keyboard interactions, and browser persistence.

## Performance

React DevTools Profiler was used to inspect TaskCard rendering during status changes.

The implementation uses:

- `React.memo` for TaskCard.
- `useCallback` for stable event-handler references.
- `useMemo` for filtering and sorting.
- Immutable state updates that preserve unchanged task object references.

After optimization, a selected single-task update showed only the affected TaskCard rendering, while the other two cards were absent from that render.

No overall speedup percentage is claimed because repeated, directly comparable timing measurements were not collected.

## Known Limitations and Trade-offs

- Data is stored locally in the browser, without account synchronization or a backend.
- Task movement uses a status dropdown rather than drag-and-drop.
- Browser storage can be cleared or unavailable.
- The initial dataset is intended for demonstration rather than production-scale usage.
- The application uses a simple native confirmation dialog for unsaved form changes rather than a custom confirmation component.
- The current automated test suite covers selected critical flows, not every UI interaction.

## AI Assistance Disclosure

AI assistance was used during development for explanations of React and TypeScript concepts, implementation suggestions, accessibility guidance, testing examples, and documentation structure.

Suggestions were reviewed and adjusted during implementation. Examples include:

- Configuring Vitest with jsdom after browser APIs were unavailable in tests.
- Removing unused TypeScript declarations detected during the production build.
- Refining modal focus behavior and keyboard interactions.
- Updating callback references and TaskCard memoization, then checking the result with React DevTools Profiler.

The final implementation was tested using the automated test suite, production build, and manual browser checks.

## Future Improvements

Potential enhancements include drag-and-drop task movement, additional accessibility tests, more extensive form and persistence tests, task import/export, and backend synchronization.