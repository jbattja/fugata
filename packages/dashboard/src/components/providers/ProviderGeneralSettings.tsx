import { FormInput } from '@/components/ui/forms/FormInput';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import { AccountType } from '@fugata/shared';

interface ProviderGeneralSettingsProps {
  formData: {
    accountCode: string;
    description: string;
    settings: Record<string, string>;
  };
  setFormData: (data: any) => void;
  availableSettings: string[];
}

export function ProviderGeneralSettings({ formData, setFormData, availableSettings }: ProviderGeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">General Information</h3>
        <div className="space-y-4">
          <FormInput
            label="Provider Code"
            value={formData.accountCode}
            onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
            required
          />
          <FormInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Provider Settings</h3>
        <KeyValueInput
          label="Settings"
          pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value }))}
          availableKeys={availableSettings}
          accountType={AccountType.PROVIDER}
          useToggleForBoolean={true}
          onChange={(values) => setFormData((prev: any) => ({ ...prev, settings: values }))}
        />
      </div>
    </div>
  );
} 