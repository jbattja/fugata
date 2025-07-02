import { ReactNode, useState } from 'react';
import { Tab } from '@headlessui/react';
import { classNames } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultIndex?: number;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ items, defaultIndex = 0, className = '', variant = 'default' }: TabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const tabVariants = {
    default: {
      list: 'border-b border-gray-200',
      tab: (selected: boolean) =>
        classNames(
          'border-b-2 py-2 px-1 text-sm font-medium',
          selected
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ),
    },
    pills: {
      list: 'space-x-1',
      tab: (selected: boolean) =>
        classNames(
          'rounded-md py-2 px-3 text-sm font-medium',
          selected
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        ),
    },
    underline: {
      list: 'border-b border-gray-200',
      tab: (selected: boolean) =>
        classNames(
          'border-b-2 py-2 px-1 text-sm font-medium transition-colors duration-200',
          selected
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ),
    },
  };

  const variantStyles = tabVariants[variant];

  return (
    <div className={className}>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className={`flex ${variantStyles.list}`}>
          {items.map((item) => (
            <Tab
              key={item.id}
              disabled={item.disabled}
              className={({ selected }) =>
                classNames(
                  variantStyles.tab(selected),
                  'flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )
              }
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-8">
          {items.map((item) => (
            <Tab.Panel key={item.id} className="focus:outline-none">
              {item.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 