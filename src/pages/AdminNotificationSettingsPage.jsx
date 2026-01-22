import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_USER_IDS } from '@/services/admin';
import {
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToNotificationSettings,
} from '@/services/notificationSettings';
import { Bell, Mail, MessageSquare, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminNotificationSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
  });

  // Check if user is admin
  const isAdmin = user && ADMIN_USER_IDS.includes(user.uid);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    // Subscribe to settings changes
    const unsubscribe = subscribeToNotificationSettings((updatedSettings) => {
      setSettings({
        emailEnabled: updatedSettings.emailEnabled,
        smsEnabled: updatedSettings.smsEnabled,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!isAdmin || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You do not have permission to update notification settings',
      });
      return;
    }

    setSaving(true);
    try {
      // Verify admin status before attempting update
      if (!isAdmin) {
        throw new Error('You do not have admin permissions');
      }
      
      console.log('Updating notification settings as admin:', user.uid);
      await updateNotificationSettings(settings, user.uid);
      toast({
        title: 'Success',
        description: 'Notification settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      console.error('User UID:', user?.uid);
      console.error('Is Admin:', isAdmin);
      console.error('Admin UIDs:', ADMIN_USER_IDS);
      
      let errorMessage = error.message || 'Failed to update notification settings';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you are logged in as an admin user and that Firestore rules have been deployed.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Admin - Notification Settings" />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You do not have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Admin - Notification Settings" />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Admin - Notification Settings" />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/admin/seed-data">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Control whether email and SMS notifications are sent system-wide.
              When disabled, no notifications will be sent regardless of user preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-enabled" className="text-base font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable all email notifications system-wide
                  </p>
                </div>
              </div>
              <Switch
                id="email-enabled"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailEnabled: checked })
                }
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="sms-enabled" className="text-base font-medium cursor-pointer">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable all SMS notifications system-wide
                  </p>
                </div>
              </div>
              <Switch
                id="sms-enabled"
                checked={settings.smsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsEnabled: checked })
                }
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> These settings apply globally to all users. When disabled,
                no notifications will be sent even if individual users have notifications enabled
                in their preferences. Changes take effect immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
