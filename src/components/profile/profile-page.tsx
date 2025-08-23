import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useEnrollmentStatus } from "@/hooks/use-enrollment-status"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  Camera, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone,
  Check,
  X
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function ProfilePage() {
  const { user, profile } = useAuth()
  const { isEnrolled } = useEnrollmentStatus()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    dateOfBirth: "",
    about: "",
    profilePictureUrl: ""
  })
  const [profileDirty, setProfileDirty] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordDirty, setPasswordDirty] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: user?.email || "",
        dateOfBirth: (profile as any).date_of_birth || "",
        about: (profile as any).about || "",
        profilePictureUrl: (profile as any).profile_picture_url || ""
      })
    }
  }, [profile, user?.email])

  const getRoleDisplay = () => {
    if (profile?.role === 'admin') return 'admin'
    return isEnrolled ? 'Enrolled Learner' : 'learner'
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setProfileDirty(true)
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
    setPasswordDirty(true)
  }

  const saveProfile = async () => {
    if (!user?.id) return
    
    setProfileSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: profileData.name,
          date_of_birth: profileData.dateOfBirth || null,
          about: profileData.about || null,
          profile_picture_url: profileData.profilePictureUrl || null
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      setProfileDirty(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProfileSaving(false)
    }
  }

  const savePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      setPasswords({ current: "", new: "", confirm: "" })
      setPasswordDirty(false)
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  const cancelProfile = () => {
    setProfileData({
      name: profile?.name || "",
      email: user?.email || "",
      dateOfBirth: "",
      about: "",
      profilePictureUrl: ""
    })
    setProfileDirty(false)
  }

  const cancelPassword = () => {
    setPasswords({ current: "", new: "", confirm: "" })
    setPasswordDirty(false)
  }

  const togglePasswordVisibility = (field: string) => {
    setPasswordVisible(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      // Create file path: userId/profile-picture.extension
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile-picture.${fileExt}`

      // Delete existing profile picture if any
      await supabase.storage
        .from('profile-pictures')
        .remove([`${user.id}/profile-picture.jpg`, `${user.id}/profile-picture.png`, `${user.id}/profile-picture.jpeg`])

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      // Update profile data
      setProfileData(prev => ({ ...prev, profilePictureUrl: publicUrl }))
      setProfileDirty(true)

      toast({
        title: "Picture uploaded",
        description: "Your profile picture has been uploaded successfully. Don't forget to save your changes.",
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Reset input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {profileData.profilePictureUrl ? (
                        <img
                          src={profileData.profilePictureUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFileUpload}
                        disabled={uploadingImage}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {uploadingImage ? "Uploading..." : "Upload Picture"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Name & DOB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-medium">
                      Date of Birth
                    </label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>

                {/* About You */}
                <div className="space-y-2">
                  <label htmlFor="about" className="text-sm font-medium">
                    About You
                  </label>
                  <Textarea
                    id="about"
                    value={profileData.about}
                    onChange={(e) => handleProfileChange('about', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {getRoleDisplay()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={saveProfile}
                    disabled={!profileDirty || profileSaving}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelProfile}
                    disabled={!profileDirty}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <div className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="current-password" className="text-sm font-medium">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={passwordVisible.current ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => handlePasswordChange('current', e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisible.current ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={passwordVisible.new ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => handlePasswordChange('new', e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisible.new ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={passwordVisible.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {passwordVisible.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={savePassword}
                      disabled={!passwordDirty || passwordSaving || !passwords.current || !passwords.new || !passwords.confirm}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelPassword}
                      disabled={!passwordDirty}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate secure codes
                      </p>
                    </div>
                    <Button
                      variant={twoFactorEnabled ? "destructive" : "default"}
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      {twoFactorEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>

                  {twoFactorEnabled && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto bg-background border rounded-lg flex items-center justify-center mb-4">
                          <span className="text-xs text-muted-foreground">QR Code</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      <div className="space-y-2 max-w-md">
                        <label htmlFor="auth-code" className="text-sm font-medium">
                          Enter verification code
                        </label>
                        <Input
                          id="auth-code"
                          placeholder="000000"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}