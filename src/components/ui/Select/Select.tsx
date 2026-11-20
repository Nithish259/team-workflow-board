import { useId, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = ({
  label,
  options,
  placeholder,
  error,
  id,
  className = '',
  required,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg px-3 py-2.5 border bg-white text-sm text-slate-900
            focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed 
            ${
              error
                ? 'border-red-500 focus:ring-red'
                : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
            }
                   ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span id={errorId} role="alert" className="text-red-600 text-xs">
          {error}
        </span>
      )}
    </div>
  );
};
