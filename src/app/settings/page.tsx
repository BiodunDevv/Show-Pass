"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Settings,
  Bell,
  Shield,
  User,
  Globe,
  Palette,
  Trash2,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Users,
  Heart,
  Calendar,
  MessageSquare,
  Lock,
  Moon,
  Sun,
  Monitor,
  Languages,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserSettings {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    newEvents?: boolean;
    eventUpdates?: boolean;
    eventReminders?: boolean;
    promotions?: boolean;
    newsletter?: boolean;
    eventApprovals?: boolean;
  };
  preferences?: {
    favoriteCategories?: string[];
    eventNotificationRadius?: number;
    autoAcceptBookings?: boolean;
    showProfile?: boolean;
    allowMessages?: boolean;
    requireEventApproval?: boolean;
    defaultEventPrivacy?: string;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showAttendingEvents?: boolean;
    showBusinessInfo?: boolean;
    profileVisibility?: string;
  };
  theme?: string;
  language?: string;
  timezone?: string;
}

import { AuthGuard } from "@/components/AuthGuard";

export default function SettingsPage() {
  return (
      <SettingsContent />
  );
}

function SettingsContent() {
  const {
    user,
    fetchUserSettings,
    updateUserSettings,
    updateUserProfile,
    deleteUserAccount,
    isLoading,
    error,
    token,
  } = useAuthStore();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState<UserSettings>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    loadSettings();
  }, [token, router]);

  const loadSettings = async () => {
    try {
      const userSettings = await fetchUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings(settings);
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (deleteType: "soft" | "hard") => {
    if (!deletePassword) {
      alert("Please enter your password to confirm account deletion");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteUserAccount({
        confirmPassword: deletePassword,
        deleteType,
        reason: "User requested deletion",
      });

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const isOrganizer = user?.role === "organizer";
  const isAdmin = user?.role === "admin";

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Settings },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  const eventCategories = [
    "Technology",
    "Music",
    "Business",
    "Food",
    "Fashion",
    "Entertainment",
    "Sports",
    "Education",
    "Health",
    "Arts",
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
  ];

  const timezones = [
    "UTC",
    "Africa/Lagos",
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/profile">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">
              Manage your account preferences and settings
            </p>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "notifications" && (
                    <NotificationsTab
                      settings={settings}
                      setSettings={setSettings}
                      isOrganizer={isOrganizer}
                    />
                  )}
                  {activeTab === "preferences" && (
                    <PreferencesTab
                      settings={settings}
                      setSettings={setSettings}
                      isOrganizer={isOrganizer}
                      eventCategories={eventCategories}
                    />
                  )}
                  {activeTab === "privacy" && (
                    <PrivacyTab
                      settings={settings}
                      setSettings={setSettings}
                      isOrganizer={isOrganizer}
                    />
                  )}
                  {activeTab === "appearance" && (
                    <AppearanceTab
                      settings={settings}
                      setSettings={setSettings}
                      languages={languages}
                      timezones={timezones}
                    />
                  )}
                  {activeTab === "account" && <AccountTab user={user} />}
                  {activeTab === "danger" && (
                    <DangerZoneTab
                      deleteConfirm={deleteConfirm}
                      setDeleteConfirm={setDeleteConfirm}
                      deletePassword={deletePassword}
                      setDeletePassword={setDeletePassword}
                      showDeletePassword={showDeletePassword}
                      setShowDeletePassword={setShowDeletePassword}
                      handleDeleteAccount={handleDeleteAccount}
                      isDeletingAccount={isDeletingAccount}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Save Button */}
              {activeTab !== "account" && activeTab !== "danger" && (
                <div className="flex justify-end mt-8 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
                  >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function NotificationsTab({
  settings,
  setSettings,
  isOrganizer,
}: {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isOrganizer: boolean;
}) {
  const updateNotification = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Notification Settings
        </h2>
        <p className="text-slate-400">
          Choose how you want to be notified about events and updates
        </p>
      </div>

      {/* Communication Methods */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="text-purple-400" size={20} />
          Communication Methods
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ToggleCard
            icon={<Mail className="text-blue-400" />}
            title="Email"
            description="Receive notifications via email"
            checked={settings.notifications?.email || false}
            onChange={(checked) => updateNotification("email", checked)}
          />
          <ToggleCard
            icon={<Smartphone className="text-green-400" />}
            title="Push Notifications"
            description="Browser and app notifications"
            checked={settings.notifications?.push || false}
            onChange={(checked) => updateNotification("push", checked)}
          />
          <ToggleCard
            icon={<Phone className="text-yellow-400" />}
            title="SMS"
            description="Text message notifications"
            checked={settings.notifications?.sms || false}
            onChange={(checked) => updateNotification("sms", checked)}
          />
        </div>
      </div>

      {/* Event Notifications */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="text-purple-400" size={20} />
          Event Notifications
        </h3>

        <div className="space-y-4">
          <ToggleItem
            title="New Events"
            description="Get notified when new events are published in your area"
            checked={settings.notifications?.newEvents || false}
            onChange={(checked) => updateNotification("newEvents", checked)}
          />
          <ToggleItem
            title="Event Updates"
            description="Receive updates about events you're attending"
            checked={settings.notifications?.eventUpdates || false}
            onChange={(checked) => updateNotification("eventUpdates", checked)}
          />
          <ToggleItem
            title="Event Reminders"
            description="Get reminded about upcoming events"
            checked={settings.notifications?.eventReminders || false}
            onChange={(checked) =>
              updateNotification("eventReminders", checked)
            }
          />
          {isOrganizer && (
            <ToggleItem
              title="Event Approvals"
              description="Get notified when your events are approved or require changes"
              checked={settings.notifications?.eventApprovals || false}
              onChange={(checked) =>
                updateNotification("eventApprovals", checked)
              }
            />
          )}
        </div>
      </div>

      {/* Marketing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Heart className="text-red-400" size={20} />
          Marketing & Promotions
        </h3>

        <div className="space-y-4">
          <ToggleItem
            title="Promotions"
            description="Receive special offers and discount codes"
            checked={settings.notifications?.promotions || false}
            onChange={(checked) => updateNotification("promotions", checked)}
          />
          <ToggleItem
            title="Newsletter"
            description="Get our weekly newsletter with event highlights"
            checked={settings.notifications?.newsletter || false}
            onChange={(checked) => updateNotification("newsletter", checked)}
          />
        </div>
      </div>
    </div>
  );
}

function PreferencesTab({
  settings,
  setSettings,
  isOrganizer,
  eventCategories,
}: {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isOrganizer: boolean;
  eventCategories: string[];
}) {
  const updatePreference = (key: string, value: any) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const toggleCategory = (category: string) => {
    const current = settings.preferences?.favoriteCategories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updatePreference("favoriteCategories", updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
        <p className="text-slate-400">
          Customize your experience and event discovery
        </p>
      </div>

      {/* Event Categories */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Heart className="text-red-400" size={20} />
          Favorite Event Categories
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {eventCategories.map((category) => {
            const isSelected =
              settings.preferences?.favoriteCategories?.includes(category) ||
              false;
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/20 text-purple-300"
                    : "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="text-sm font-medium">{category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="text-blue-400" size={20} />
          Event Discovery
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Notification Radius (km)
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={settings.preferences?.eventNotificationRadius || 50}
              onChange={(e) =>
                updatePreference(
                  "eventNotificationRadius",
                  parseInt(e.target.value)
                )
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-slate-400 mt-1">
              <span>5km</span>
              <span className="text-purple-400 font-medium">
                {settings.preferences?.eventNotificationRadius || 50}km
              </span>
              <span>100km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Preferences */}
      {isOrganizer && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="text-green-400" size={20} />
            Organizer Settings
          </h3>

          <div className="space-y-4">
            <ToggleItem
              title="Auto-accept Bookings"
              description="Automatically approve ticket purchases without manual review"
              checked={settings.preferences?.autoAcceptBookings || false}
              onChange={(checked) =>
                updatePreference("autoAcceptBookings", checked)
              }
            />
            <ToggleItem
              title="Show Profile"
              description="Make your organizer profile visible to event attendees"
              checked={settings.preferences?.showProfile || false}
              onChange={(checked) => updatePreference("showProfile", checked)}
            />
            <ToggleItem
              title="Allow Messages"
              description="Let attendees send you direct messages"
              checked={settings.preferences?.allowMessages || false}
              onChange={(checked) => updatePreference("allowMessages", checked)}
            />
            <ToggleItem
              title="Require Event Approval"
              description="All events need admin approval before going live"
              checked={settings.preferences?.requireEventApproval || false}
              onChange={(checked) =>
                updatePreference("requireEventApproval", checked)
              }
            />

            <div>
              <label className="block text-white font-medium mb-2">
                Default Event Privacy
              </label>
              <select
                value={settings.preferences?.defaultEventPrivacy || "public"}
                onChange={(e) =>
                  updatePreference("defaultEventPrivacy", e.target.value)
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite-only">Invite Only</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrivacyTab({
  settings,
  setSettings,
  isOrganizer,
}: {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isOrganizer: boolean;
}) {
  const updatePrivacy = (key: string, value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Privacy Settings</h2>
        <p className="text-slate-400">
          Control what information is visible to others
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="text-blue-400" size={20} />
          Contact Information Visibility
        </h3>

        <div className="space-y-4">
          <ToggleItem
            title="Show Email Address"
            description="Other users can see your email address on your profile"
            checked={settings.privacy?.showEmail || false}
            onChange={(checked) => updatePrivacy("showEmail", checked)}
          />
          <ToggleItem
            title="Show Phone Number"
            description="Display your phone number on your public profile"
            checked={settings.privacy?.showPhone || false}
            onChange={(checked) => updatePrivacy("showPhone", checked)}
          />
          <ToggleItem
            title="Show Attending Events"
            description="Let others see which events you're attending"
            checked={settings.privacy?.showAttendingEvents || false}
            onChange={(checked) =>
              updatePrivacy("showAttendingEvents", checked)
            }
          />
          {isOrganizer && (
            <ToggleItem
              title="Show Business Information"
              description="Display your business details on your organizer profile"
              checked={settings.privacy?.showBusinessInfo || false}
              onChange={(checked) => updatePrivacy("showBusinessInfo", checked)}
            />
          )}
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Eye className="text-purple-400" size={20} />
          Profile Visibility
        </h3>

        <div>
          <label className="block text-white font-medium mb-3">
            Who can see your profile?
          </label>
          <div className="space-y-3">
            {[
              {
                value: "public",
                label: "Everyone",
                description: "Your profile is visible to all users",
              },
              {
                value: "private",
                label: "Nobody",
                description: "Only you can see your profile",
              },
              {
                value: "friends",
                label: "Friends Only",
                description: "Only people you've connected with",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  settings.privacy?.profileVisibility === option.value
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                }`}
              >
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={settings.privacy?.profileVisibility === option.value}
                  onChange={(e) =>
                    updatePrivacy("profileVisibility", e.target.value)
                  }
                  className="mt-1 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-slate-400 text-sm">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab({
  settings,
  setSettings,
  languages,
  timezones,
}: {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  languages: { code: string; name: string }[];
  timezones: string[];
}) {
  const updateSetting = (key: string, value: any) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Appearance & Localization
        </h2>
        <p className="text-slate-400">
          Customize how ShowPass looks and behaves
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Palette className="text-purple-400" size={20} />
          Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              value: "light",
              label: "Light",
              icon: Sun,
              description: "Light theme",
            },
            {
              value: "dark",
              label: "Dark",
              icon: Moon,
              description: "Dark theme (default)",
            },
            {
              value: "auto",
              label: "Auto",
              icon: Monitor,
              description: "Follow system",
            },
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                onClick={() => updateSetting("theme", theme.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === theme.value
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                }`}
              >
                <Icon className="mx-auto mb-2 text-2xl" size={32} />
                <div className="text-white font-medium">{theme.label}</div>
                <div className="text-slate-400 text-sm">
                  {theme.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Languages className="text-blue-400" size={20} />
          Language
        </h3>

        <div>
          <select
            value={settings.language || "en"}
            onChange={(e) => updateSetting("language", e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="text-green-400" size={20} />
          Timezone
        </h3>

        <div>
          <select
            value={settings.timezone || "UTC"}
            onChange={(e) => updateSetting("timezone", e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Account Information
        </h2>
        <p className="text-slate-400">View your account details and status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Full Name
              </label>
              <div className="text-white font-medium">
                {user?.firstName} {user?.lastName}
              </div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Email Address
              </label>
              <div className="text-white font-medium">{user?.email}</div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Phone Number
              </label>
              <div className="text-white font-medium">
                {user?.phone || "Not provided"}
              </div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">Role</label>
              <div className="text-white font-medium capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Account Status</h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Verification Status
              </label>
              <div
                className={`flex items-center gap-2 ${
                  user?.isVerified ? "text-green-400" : "text-yellow-400"
                }`}
              >
                <CheckCircle size={16} />
                {user?.isVerified ? "Verified" : "Pending Verification"}
              </div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Account Created
              </label>
              <div className="text-white font-medium">
                {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg">
              <label className="block text-slate-400 text-sm mb-1">
                Last Updated
              </label>
              <div className="text-white font-medium">
                {new Date(user?.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerZoneTab({
  deleteConfirm,
  setDeleteConfirm,
  deletePassword,
  setDeletePassword,
  showDeletePassword,
  setShowDeletePassword,
  handleDeleteAccount,
  isDeletingAccount,
}: {
  deleteConfirm: string;
  setDeleteConfirm: (value: string) => void;
  deletePassword: string;
  setDeletePassword: (value: string) => void;
  showDeletePassword: boolean;
  setShowDeletePassword: (value: boolean) => void;
  handleDeleteAccount: (type: "soft" | "hard") => void;
  isDeletingAccount: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-slate-400">
          Irreversible actions that affect your account
        </p>
      </div>

      <div className="border border-red-500/30 rounded-xl p-6 bg-red-500/5">
        <div className="flex items-start gap-4 mb-6">
          <AlertTriangle className="text-red-400 mt-1" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Delete Account
            </h3>
            <p className="text-slate-300 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Enter your password to confirm:
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showDeletePassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleDeleteAccount("soft")}
            disabled={
              deleteConfirm !== "DELETE" || !deletePassword || isDeletingAccount
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            {isDeletingAccount ? "Deleting..." : "Soft Delete (Recoverable)"}
          </button>

          <button
            onClick={() => handleDeleteAccount("hard")}
            disabled={
              deleteConfirm !== "DELETE" || !deletePassword || isDeletingAccount
            }
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            {isDeletingAccount ? "Deleting..." : "Hard Delete (Permanent)"}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          <p>
            • Soft delete: Account deactivated, can be recovered within 30 days
          </p>
          <p>• Hard delete: Account and all data permanently removed</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ToggleCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{title}</h4>
          <p className="text-slate-400 text-sm mb-3">{description}</p>
          <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              checked ? "bg-purple-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                checked ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 bg-slate-700/30 rounded-lg">
      <div className="flex-1">
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
          checked ? "bg-purple-600" : "bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
