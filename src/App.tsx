import { useState } from 'react';
import Button from './components/ui/Button/Button';
import { TextInput } from './components/ui/TextInput/TextInput';
import { TextArea } from './components/ui/TextArea/TextArea';
import { Select } from './components/ui/Select/Select';

function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('backlog');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setError('');
    alert(`Task "${title}" is valid!`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create Task</h1>

        <p className="mt-2 text-sm text-slate-500">
          Everquint Design System — Form Preview
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <TextInput
            label="Task Title"
            placeholder="Enter task title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error) setError('');
            }}
            error={error}
            required
          />

          <TextArea
            label="Description"
            placeholder="Describe the task..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { label: 'Backlog', value: 'backlog' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Done', value: 'done' },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setTitle('');
                setDescription('');
                setStatus('backlog');
                setPriority('medium');
                setError('');
              }}
            >
              Reset
            </Button>

            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default App;
