import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const titleId = useId();

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="
        fixed inset-0 m-auto
        w-[calc(100%-2rem)] max-w-lg
        rounded-2xl border border-slate-200
        bg-white p-0 text-slate-900
        shadow-2xl
        backdrop:bg-slate-950/50
      "
    >
      <div
        className="flex items-center justify-between
                      border-b border-slate-200 p-5"
      >
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg px-2 py-1
                     text-xl text-slate-500
                     hover:bg-slate-100
                     focus-visible:outline-2
                     focus-visible:outline-blue-500"
        >
          ×
        </button>
      </div>

      <div className="p-5">{children}</div>
    </dialog>,
    document.body,
  );
}
