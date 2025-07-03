import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMerchantContext } from '@/contexts/MerchantContext';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ClockIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Successful Payments',
    value: '2,338',
    change: '+15.3%',
    changeType: 'positive',
    icon: CreditCardIcon,
  },
  {
    name: 'Average Processing Time',
    value: '1.2s',
    change: '-0.5s',
    changeType: 'negative',
    icon: ClockIcon,
  },
];

const providers = [
  {
    name: 'Stripe',
    successRate: 99.8,
    volume: '$23,456',
    change: '+12.3%',
  },
  {
    name: 'Adyen',
    successRate: 99.5,
    volume: '$18,234',
    change: '+8.7%',
  },
  {
    name: 'PayPal',
    successRate: 98.9,
    volume: '$12,789',
    change: '+5.4%',
  },
];
export default function Home() {
    const { data: session } = useSession();
    const { activeMerchant, isInMerchantContext } = useMerchantContext();

    if (!session) {
      return null;
    }
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
            {isInMerchantContext && activeMerchant && (
              <span className="ml-3 text-lg font-normal text-gray-500">
                - {activeMerchant.accountCode}
              </span>
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            <span className="text-red-500">The below data is still a mockup and will be replaced with real data in the future.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary-500 p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
                  )}
                  <span className="sr-only">{stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by</span>
                  {stat.change}
                </p>
              </dd>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Provider Performance</h3>
            <div className="mt-6 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Provider
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Success Rate
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Volume
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {providers.map((provider) => (
                        <tr key={provider.name}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {provider.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{provider.successRate}%</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{provider.volume}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{provider.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 