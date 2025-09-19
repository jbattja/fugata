import React from 'react';

interface BooleanToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  trueLabel?: string;
  falseLabel?: string;
}

export function BooleanToggle({
  value,
  onChange,
  disabled = false,
  label,
  trueLabel = 'True',
  falseLabel = 'False'
}: BooleanToggleProps) {
  return (
    <div className="flex items-center space-x-3">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          disabled={disabled}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            !value
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {falseLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          disabled={disabled}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            value
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {trueLabel}
        </button>
      </div>
    </div>
  );
}
