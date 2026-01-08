import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { ArrowLeft, Settings, User, Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut, updateUserProfile, changeEmail, changePassword } from '@/services/auth';
import { uploadFile } from '@/services/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { AppHeader } from '@/components/shared/AppHeader';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { fontSize, setFontSize, theme, setTheme } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(userProfile?.photo || user?.photoURL || null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // Separate loading states
  const [loadingDisplayName, setLoadingDisplayName] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Sync form state with userProfile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
      setProfilePhoto(userProfile.photo || user?.photoURL || null);
    }
  }, [userProfile, user?.photoURL]);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image file',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Image size must be less than 5MB',
      });
      return;
    }

    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    setLoadingDisplayName(true);

    let updates = { displayName: displayName || null };
    
    // Upload photo if new one is selected
    if (profilePhotoFile) {
      try {
        const photoData = await uploadFile(profilePhotoFile, `users/${user.uid}/profile/`);
        updates.photo = photoData.url;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to upload profile photo',
        });
        setLoadingDisplayName(false);
        return;
      }
    }

    if (displayName !== userProfile?.displayName || profilePhotoFile) {
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
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
    setLoadingDisplayName(false);
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setLoadingPhone(true);

    if (phone !== userProfile?.phone) {
      const result = await updateUserProfile({ phone: phone || null });
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Phone number updated successfully',
        });
      }
    }
    setLoadingPhone(false);
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

    setLoadingEmail(true);
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
    setLoadingEmail(false);
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

    setLoadingPassword(true);
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
    setLoadingPassword(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Settings" />

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
            {/* Display Name and Profile Picture */}
            <div>
              <h3 className="text-sm font-medium mb-4">Display Name & Profile Picture</h3>
              <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-20 w-20">
                      {profilePhotoPreview || profilePhoto ? (
                        <AvatarImage src={profilePhotoPreview || profilePhoto} alt="Profile" />
                      ) : null}
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      {(profilePhotoPreview || profilePhoto) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePhoto}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loadingDisplayName} 
                  className="bg-[#74C947] hover:bg-[#66b83d] text-white"
                >
                  {loadingDisplayName ? 'Saving...' : 'Save Display Name & Photo'}
                </Button>
              </form>
            </div>

            {/* Phone Number */}
            <div className="pt-4 border-t dark:border-gray-700">
              <h3 className="text-sm font-medium mb-4">Phone Number</h3>
              <form onSubmit={handleUpdatePhone} className="space-y-4">
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
                <Button 
                  type="submit" 
                  disabled={loadingPhone} 
                  variant="outline"
                >
                  {loadingPhone ? 'Saving...' : 'Save Phone Number'}
                </Button>
              </form>
            </div>

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
                <Button 
                  type="submit" 
                  disabled={loadingEmail} 
                  variant="outline"
                >
                  {loadingEmail ? 'Updating...' : 'Update Email'}
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
                <Button 
                  type="submit" 
                  disabled={loadingPassword} 
                  variant="outline"
                >
                  {loadingPassword ? 'Updating...' : 'Update Password'}
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
