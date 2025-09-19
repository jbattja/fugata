import React from 'react';
import { getSettingsConfig, AccountType } from '@fugata/shared';
import { BooleanToggle } from './BooleanToggle';
import { SharedLogger } from '@fugata/shared';

interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueInputProps {
  label: string;
  pairs: KeyValuePair[];
  disabled?: boolean;
  availableKeys?: string[];
  accountType?: AccountType;
  useToggleForBoolean?: boolean;
  onChange?: (values: Record<string, any>) => void;
}

export function KeyValueInput({ 
  label, 
  disabled = false,
  pairs = [],
  availableKeys = [],
  accountType = AccountType.MERCHANT,
  useToggleForBoolean = false,
  onChange
}: KeyValueInputProps) {
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const [editingValues, setEditingValues] = React.useState<Record<string, string>>({});

  // Get settings configuration to determine input types
  const settingsConfig = React.useMemo(() => {
    try {
      return getSettingsConfig(accountType, null);
    } catch {
      return {};
    }
  }, [accountType]);

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
    // Only update if the user actually changed the value
    const newValue = editingValues[key];
    if (newValue !== undefined) {
      const currentValues = pairsToValues(pairs);
      const updatedValues = {
        ...currentValues,
        [key]: newValue
      };
      
      onChange?.(updatedValues);
    }
    
    // Always clear the editing state
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

  // Get the input type for a specific setting key
  const getInputType = (key: string) => {
    const setting = (settingsConfig as any)[key];
    return setting?.type || 'string';
  };

  // Render appropriate input based on setting type
  const renderValueInput = (key: string, value: string) => {
    const inputType = getInputType(key);
    const currentValue = editingValues[key] !== undefined ? editingValues[key] : value;

    if (inputType === 'boolean') {
      const boolValue = currentValue === 'true';
      
      if (useToggleForBoolean) {
        return (
          <BooleanToggle
            value={boolValue}
            onChange={(value) => handleValueChange(key, value.toString())}
            disabled={disabled}
          />
        );
      }
      
      return (
        <select
          value={boolValue ? 'true' : 'false'}
          onChange={(e) => handleValueChange(key, e.target.value)}
          onBlur={() => handleValueBlur(key)}
          className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={disabled}
        >
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      );
    }

    if (inputType === 'number') {
      return (
        <input
          type="number"
          value={currentValue}
          onChange={(e) => handleValueChange(key, e.target.value)}
          onBlur={() => handleValueBlur(key)}
          onKeyDown={(e) => {
            // Save on Enter key
            if (e.key === 'Enter') {
              handleValueBlur(key);
            }
          }}
          className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={disabled}
          min={(settingsConfig as any)[key]?.min}
          max={(settingsConfig as any)[key]?.max}
        />
      );
    }

    // Default to text input for string type
    return (
      <input
        type="text"
        value={currentValue}
        onChange={(e) => handleValueChange(key, e.target.value)}
        onBlur={() => handleValueBlur(key)}
        onKeyDown={(e) => {
          // Save on Enter key
          if (e.key === 'Enter') {
            handleValueBlur(key);
          }
        }}
        className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        disabled={disabled}
      />
    );
  };

  // Render appropriate input for new value based on selected key
  const renderNewValueInput = () => {
    const inputType = getInputType(newKey);

    if (inputType === 'boolean') {
      return (
        <select
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={disabled}
        >
          <option value="">Select value</option>
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      );
    }

    if (inputType === 'number') {
      return (
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Number value"
          className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={disabled}
          min={(settingsConfig as any)[newKey]?.min}
          max={(settingsConfig as any)[newKey]?.max}
        />
      );
    }

    // Default to text input
    return (
      <input
        type="text"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        onBlur={() => addValue(newKey, newValue)}
        placeholder="Value"
        className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        disabled={disabled}
      />
    );
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
            {renderValueInput(key, value)}
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
            onChange={(e) => {
              setNewKey(e.target.value);
              setNewValue(''); // Reset value when key changes
            }}
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
          {renderNewValueInput()}
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