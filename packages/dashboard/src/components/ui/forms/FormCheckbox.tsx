import React, { InputHTMLAttributes } from 'react';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormCheckbox({ label, error, className = '', ...props }: FormCheckboxProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className={`rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`}
            {...props}
          />
          <span className="ml-2">{label}</span>
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
} 