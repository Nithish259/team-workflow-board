# Architecture and Technical Notes

## 1. Architecture Overview

The Team Workflow Board is a client-side React application organized by responsibility.

The architecture separates:

- **Presentation:** Reusable UI components and task-specific components.
- **State management:** Custom hooks for tasks and filters.
- **Data persistence:** Versioned localStorage utilities.
- **Domain types:** TypeScript interfaces and union types.

This separation makes it easier to test and extend individual parts of the application.

## 2. Component Hierarchy

```text
App
└── TaskBoard
    ├── Create Task Button
    ├── Storage Warning
    ├── TaskFiltersBar
    ├── Backlog Column
    │   └── MemoizedTaskCard
    ├── In Progress Column
    │   └── MemoizedTaskCard
    ├── Done Column
    │   └── MemoizedTaskCard
    ├── Modal
    │   └── TaskForm
    └── Toast
```

TaskBoard is the main coordinating component. It passes task data and event handlers to child components.

The UI design system contains reusable Button, TextInput, TextArea, Select, Badge, Card, Modal, and Toast components.

## 3. Task Data Model

A task is represented by the following TypeScript interface:

```typescript
type TaskStatus = 'backlog' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

Union types restrict status and priority values to valid choices.

`createdAt` and `updatedAt` are stored as ISO date strings so they can be serialized to JSON and compared for sorting.

## 4. State Management

### useTasks

The `useTasks` hook manages the task collection and exposes operations for creating, editing, and changing task statuses.

Task updates are immutable. A changed task receives a new object, while unchanged tasks retain their existing object references.

This supports predictable React updates and component memoization.

### useTaskFilters

The `useTaskFilters` hook manages search, status filters, priority filters, and sorting.

The hook reads initial selections from URL query parameters and writes updated selections back to the URL.

This makes the current board view restorable after refresh and shareable through its URL.

### Why not Redux or Zustand?

The application has a limited state-management scope. Custom React hooks provide sufficient separation without introducing additional dependencies or architectural complexity.

A more extensive application with multiple routes, server synchronization, and shared asynchronous state might justify a dedicated state-management or data-fetching solution.

## 5. Persistence and Schema Migration

Task data is stored under a dedicated localStorage key.

The current schema uses version 2:

```json
{
  "schemaVersion": 2,
  "tasks": []
}
```

The storage layer validates saved data before loading it.

### Version 1 to Version 2 Migration

The simulated version 1 task structure may omit fields introduced in version 2.

During migration:

- Missing descriptions and assignees receive empty strings.
- Missing priorities receive `"medium"`.
- Missing tags receive an empty array.
- Missing dates receive valid fallback timestamps.
- `updatedAt` is initialized using the creation timestamp where needed.

After migration, the application displays a non-intrusive notification.

### Error Handling

The storage layer handles malformed JSON, invalid records, unsupported schema versions, and storage access failures.

If stored data cannot be loaded safely, the application can use fallback task data and display a warning rather than crashing.

An intentionally saved empty task array is preserved instead of being mistaken for missing storage.

### Trade-off

localStorage is simple and requires no backend, but it does not provide multi-user synchronization, server-side validation, or durable cloud backups.

## 6. Filtering and Sorting

Filtering and sorting are derived from task state rather than stored as a second task collection.

Filtering supports:

- Multiple selected statuses.
- Priority.
- Case-insensitive text matching against title and description.

Sorting supports:

- Creation timestamp.
- Update timestamp.
- Priority.

`useMemo` caches the derived task list until task data or filter state changes.

This avoids unnecessary recalculation during unrelated UI updates, such as opening a modal.

## 7. Performance Optimization

### Problem

React DevTools Profiler was used to inspect rendering behavior during task status updates.

An earlier selected update showed all three TaskCard components rendering.

### Changes

**React.memo**

TaskCard was wrapped with `React.memo`, allowing React to skip rendering when its props are unchanged.

**useCallback**

TaskBoard event handlers were memoized to keep function references stable across unrelated parent renders.

**Immutable updates**

The task state updater creates a new object only for a task whose status actually changes.

Unchanged tasks retain their previous references.

**useMemo**

The board's filtered and sorted task list is memoized.

### Verification

A later controlled single-task status update showed only the affected TaskCard in the selected React Profiler commit. The two unchanged TaskCards were absent.

This supports the conclusion that unnecessary TaskCard rendering was reduced.

### Measurement Limitation

The available profiling screenshots do not establish a reliable overall rendering-time improvement. Different commits and development-mode conditions can produce different timings.

Therefore, the documented improvement is reduced unnecessary component rendering, not a claimed percentage reduction in execution time.

### Trade-off

Memoization introduces prop-reference considerations and some comparison overhead. It is justified here because task cards are repeated components and the board can re-render due to state changes unrelated to individual cards.

## 8. Accessibility

The application uses semantic controls and accessible labels for task interactions.

The Modal uses the native HTML `dialog` element and its `showModal()` method.

Focus management is handled using React refs and effects.

The dialog supports keyboard interaction, including Escape handling, while the parent coordinates confirmation before discarding unsaved form changes.

Task forms provide client-side validation and error feedback.

The application also uses status messages and alerts for user feedback.

## 9. Testing Strategy

Vitest and React Testing Library are used to test user-facing workflows and storage logic.

### Component Tests

TaskBoard tests cover task creation, status updates, search filtering, and required-title validation.

### Storage Tests

Storage tests cover version migration, corrupted JSON, empty saved task collections, and unsupported versions.

### Environment

Tests run in jsdom to provide browser-like APIs, including document, window, and localStorage.

### Verification

At the latest verification:

- Eight automated tests passed.
- The TypeScript and Vite production build completed successfully.
- Core UI interactions were manually checked.

## 10. Refactoring Decisions

### Refactor: Stabilizing TaskCard Props

Initially, TaskBoard passed callback functions created during each render.

This meant TaskCard could receive new function references even when its task data was unchanged.

The handlers were refactored using `useCallback`, and TaskCard was wrapped with `React.memo`.

The existing task updater already preserved unchanged object references, enabling memoization to work effectively.

The result was verified using React DevTools Profiler.

### Refactor: Test Environment Configuration

The first test run failed because localStorage was unavailable.

Vitest was configured to use jsdom, allowing tests to execute with simulated browser APIs.

### Refactor: TypeScript Cleanup

Unused imports and type declarations were removed after the production build identified them.

This preserved strict compiler checks instead of disabling them.

## 11. AI Assistance and Review

During development, issues were identified through actual test execution, TypeScript compilation, browser checks, and React DevTools profiling. The implementation was adjusted based on those findings.

Examples include correcting the Vitest environment, removing unused declarations, and verifying the TaskCard optimization rather than assuming memoization improved performance.

## 12. Future Improvements

With additional development time, the application could add:

- Import and export of task data.
- Additional keyboard and accessibility automation.
- More comprehensive form and persistence tests.
- Backend synchronization and multi-user collaboration.
- Performance measurements using larger task datasets.
