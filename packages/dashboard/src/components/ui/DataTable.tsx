import { useState } from 'react';
import { Button } from './Button';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | React.ReactNode);
  className?: string;
}

interface ActionButton<T> {
  name: string;
  action: (item: T) => void;
}


interface DataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T | string)[];
  onAdd?: () => void;
  addButtonText?: string;
  onRowClick?: (item: T) => void;
  actionButtons?: ActionButton<T>[];
}

export function DataTable<T>({
  title,
  description,
  data,
  columns,
  searchKeys,
  onAdd,
  addButtonText = 'Add New',
  onRowClick,
  actionButtons,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter((item) =>
    searchKeys.some((key) => {
      if (typeof key === 'string' && key.includes('.')) {
        const [parent, child] = key.split('.');
        const value = item[parent as keyof T]?.[child as keyof typeof item[keyof T]];
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      }
      const value = item[key as keyof T];
      return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            {description}
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </div>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                  {columns.map((column, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        {column.header}
                      </th>
                    ))}
                    {actionButtons && actionButtons.length > 0 && (
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredData.map((item, rowIndex) => (
                    <tr
                      key={rowIndex}
                      onClick={() => onRowClick?.(item)}
                      className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 ${column.className || ''}`}
                        >
                          {typeof column.accessor === 'function'
                            ? column.accessor(item)
                            : item[column.accessor]?.toString()}
                        </td>
                      ))}
                      {actionButtons && actionButtons.length > 0 && ( 
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="inline-flex gap-2">
                          {actionButtons.map((button, buttonIndex) => (
                          <Button
                            key={buttonIndex}
                            variant="secondary"
                            size="sm"
                            onClick={() => button.action(item)}
                          >{button.name}
                          </Button>
                          ))}
                        </div>
                      </td>
                    )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 