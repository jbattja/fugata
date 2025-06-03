import React from 'react';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  label: string;
  pairs: KeyValuePair[];
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string) => void;
  disabled?: boolean;
}

export function KeyValueInput({ label, pairs, onAdd, onRemove, disabled = false }: KeyValueInputProps) {
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');

  const handleAdd = () => {
    if (newKey && newValue) {
      onAdd(newKey, newValue);
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 space-y-4">
        {pairs.map(({ key, value }) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="text"
              value={key}
              disabled
              className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <input
              type="text"
              value={value}
              disabled
              className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => onRemove(key)}
              className="text-red-600 hover:text-red-800"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key"
            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={disabled}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="text-indigo-600 hover:text-indigo-800"
            disabled={disabled}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
} 