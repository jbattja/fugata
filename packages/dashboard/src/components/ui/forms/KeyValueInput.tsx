import React from 'react';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  label: string;
  pairs: KeyValuePair[];
  disabled?: boolean;
  availableKeys?: string[];
  onChange?: (values: Record<string, any>) => void;
}

export function KeyValueInput({ 
  label, 
  disabled = false,
  pairs = [],
  availableKeys = [],
  onChange
}: KeyValueInputProps) {
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [editingValues, setEditingValues] = React.useState<Record<string, string>>({});

  const pairsToValues = (pairs: KeyValuePair[]): Record<string, any> => {
    return pairs.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  const addValue = (key: string, value: string) => {
    if (!key || !value) return;
    
    const currentValues = pairsToValues(pairs);
    const updatedValues = {
      ...currentValues,
      [key]: value,
    };
    
    onChange?.(updatedValues);
    setNewKey('');
    setNewValue('');
  };

  const removeValue = (key: string) => {
    const currentValues = pairsToValues(pairs);
    const updatedValues = { ...currentValues };
    delete updatedValues[key];
    
    onChange?.(updatedValues);
  };

  const handleValueChange = (key: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleValueBlur = (key: string) => {
    const currentValues = pairsToValues(pairs);
    const updatedValues = {
      ...currentValues,
      [key]: editingValues[key]
    };
    
    onChange?.(updatedValues);
    setEditingValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  };

  // Get available keys that haven't been used yet
  const getAvailableKeys = () => {
    const usedKeys = new Set(pairs.map(pair => pair.key));
    return availableKeys.filter(option => !usedKeys.has(option));
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
              value={editingValues[key] !== undefined ? editingValues[key] : value}
              onChange={(e) => handleValueChange(key, e.target.value)}
              onBlur={() => handleValueBlur(key)}
              className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => removeValue(key)}
              className="text-red-600 hover:text-red-800"
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <select
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={disabled}
          >
            <option value="">Select a setting</option>
            {getAvailableKeys().map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onBlur={() => addValue(newKey, newValue)}
            placeholder="Value"
            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => addValue(newKey, newValue)}
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