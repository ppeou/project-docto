import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { ArrowLeft, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut, updateUserProfile, changeEmail, changePassword } from '@/services/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { fontSize, setFontSize, theme, setTheme } = useSettingsStore();
  const { toast } = useToast();

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync form state with userProfile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updates = {};
    if (displayName !== userProfile?.displayName) {
      updates.displayName = displayName;
    }
    if (phone !== userProfile?.phone) {
      updates.phone = phone || null;
    }

    if (Object.keys(updates).length > 0) {
      const result = await updateUserProfile(updates);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      }
    }
    setLoading(false);
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailCurrentPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your current password to change email',
      });
      return;
    }

    setLoading(true);
    const result = await changeEmail(email, emailCurrentPassword);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Email updated successfully',
      });
      setEmailCurrentPassword('');
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordCurrentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all password fields',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    const result = await changePassword(newPassword, passwordCurrentPassword);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else {
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      setPasswordCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name and Phone */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-[#74C947] hover:bg-[#66b83d] text-white">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>

            {/* Change Email */}
            <div className="pt-4 border-t dark:border-gray-700">
              <h3 className="text-sm font-medium mb-4">Change Email</h3>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="newemail@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailCurrentPassword">Current Password</Label>
                  <PasswordInput
                    id="emailCurrentPassword"
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} variant="outline">
                  {loading ? 'Updating...' : 'Update Email'}
                </Button>
              </form>
            </div>

            {/* Change Password */}
            <div className="pt-4 border-t dark:border-gray-700">
              <h3 className="text-sm font-medium mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordCurrentPassword">Current Password</Label>
                  <PasswordInput
                    id="passwordCurrentPassword"
                    value={passwordCurrentPassword}
                    onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} variant="outline">
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Accessibility Settings</CardTitle>
            </div>
            <CardDescription>
              Customize font size and theme to suit your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Font Size</Label>
              <div className="grid grid-cols-4 gap-3">
                {['small', 'regular', 'large', 'extra-large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      fontSize === size
                        ? 'border-[#74C947] bg-[#74C947]/10 dark:bg-[#74C947]/20 text-[#74C947] dark:text-[#74C947] font-semibold'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{size.replace('-', ' ')}</div>
                    <div
                      className={`mt-1 ${
                        size === 'small' ? 'text-xs' :
                        size === 'regular' ? 'text-sm' :
                        size === 'large' ? 'text-base' :
                        'text-lg'
                      }`}
                    >
                      Aa
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === themeOption
                        ? 'border-[#74C947] bg-[#74C947]/10 dark:bg-[#74C947]/20 text-[#74C947] dark:text-[#74C947] font-semibold'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{themeOption}</div>
                    {themeOption === 'system' && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Follow system
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

