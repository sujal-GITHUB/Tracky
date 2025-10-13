'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'GetsugaTenshou',
    siteDescription: 'Premium Anime Merchandise Store',
    contactEmail: 'support@getsugatenshou.com',
    contactPhone: '+91 9876543210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenanceMode: false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically save settings to your backend
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Settings have been saved successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your store settings and configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-black dark:text-white">General Settings</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => updateSetting('contactPhone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-medium text-black dark:text-white">Maintenance Mode</h3>
            </div>
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-black dark:text-white">
                Enable maintenance mode
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              When enabled, your store will be temporarily unavailable to customers.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 border border-gray-300 dark:border-gray-500">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">Actions</h3>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
