import { TaskBoard } from './features/tasks/components/TaskBoard';

function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Team Workflow Board
          </h1>

          <p className="mt-2 text-slate-500">
            Organize and track your team's work.
          </p>
        </header>

        <TaskBoard />
      </div>
    </main>
  );
}

export default App;
