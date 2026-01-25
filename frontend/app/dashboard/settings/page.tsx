"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User, Globe, Users, Bell, CreditCard, HelpCircle, Trash2 } from "lucide-react";

type AccountData = {
  id: string;
  name: string | null;
  email: string;
};

type PreferencesData = {
  defaultCurrency: string;
  numberFormat: string;
  language: string;
};

type NotificationSettings = {
  groupEvents: boolean;
  expenseEvents: boolean;
  inviteEvents: boolean;
  paymentDueEvents: boolean;
  paymentReminderFrequency: string;
  doNotDisturbFrom: string | null;
  doNotDisturbTo: string | null;
  doNotDisturbAlways: boolean;
};

type Group = {
  id: string;
  name: string;
  description: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");

  // Account Settings
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [numberFormat, setNumberFormat] = useState("1000");
  const [language, setLanguage] = useState("en");
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(null);

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationsSuccess, setNotificationsSuccess] = useState<string | null>(null);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupSettings, setGroupSettings] = useState<any>(null);

  useEffect(() => {
    fetchAccount();
    fetchPreferences();
    fetchNotificationSettings();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupSettings(selectedGroupId);
    }
  }, [selectedGroupId]);

  const fetchAccount = async () => {
    try {
      const res = await fetch("http://localhost:3000/settings/account", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
        setName(data.name || "");
        setEmail(data.email || "");
      }
    } catch (err) {
      console.error("Failed to fetch account", err);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch("http://localhost:3000/settings/preferences", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
        setDefaultCurrency(data.defaultCurrency || "USD");
        setNumberFormat(data.numberFormat || "1000");
        setLanguage(data.language || "en");
      }
    } catch (err) {
      console.error("Failed to fetch preferences", err);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch("http://localhost:3000/settings/notifications", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch notification settings", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:3000/groups", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const fetchGroupSettings = async (groupId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/settings/groups/${groupId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGroupSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch group settings", err);
    }
  };

  const handleUpdateAccount = async () => {
    setAccountError(null);
    setAccountSuccess(null);

    try {
      const res = await fetch("http://localhost:3000/settings/account", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update account");

      setAccountSuccess("Account updated successfully");
      await fetchAccount();
    } catch (err: any) {
      setAccountError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setAccountError(null);
    setAccountSuccess(null);

    if (newPassword !== confirmPassword) {
      setAccountError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setAccountError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/settings/account/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setAccountSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setAccountError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("http://localhost:3000/settings/account", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      router.push("/login");
    } catch (err: any) {
      setAccountError(err.message);
    }
  };

  const handleUpdatePreferences = async () => {
    setPreferencesError(null);
    setPreferencesSuccess(null);

    try {
      const res = await fetch("http://localhost:3000/settings/preferences", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCurrency,
          numberFormat,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update preferences");

      setPreferencesSuccess(
        defaultCurrency !== preferences?.defaultCurrency
          ? `Default currency ${defaultCurrency} set. It will be applied to groups created from now on.`
          : "Preferences updated successfully"
      );
      await fetchPreferences();
    } catch (err: any) {
      setPreferencesError(err.message);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!notificationSettings) return;

    setNotificationsError(null);
    setNotificationsSuccess(null);

    try {
      const res = await fetch("http://localhost:3000/settings/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update notification settings");

      setNotificationsSuccess("Notification settings updated successfully");
      await fetchNotificationSettings();
    } catch (err: any) {
      setNotificationsError(err.message);
    }
  };

  const handleToggleGroupNotifications = async (groupId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/settings/groups/${groupId}/notifications/toggle`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to toggle notifications");

      if (selectedGroupId === groupId) {
        await fetchGroupSettings(groupId);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      const res = await fetch(`http://localhost:3000/settings/groups/${groupId}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to leave group");

      await fetchGroups();
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setGroupSettings(null);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"];

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <SectionHeader className="mb-6">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </SectionHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="support">
              <HelpCircle className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Account Settings</h2>

              {accountError && (
                <div className="text-red-400 text-sm">{accountError}</div>
              )}
              {accountSuccess && (
                <div className="text-green-400 text-sm">{accountSuccess}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>

                <GlossyButton onClick={handleUpdateAccount}>
                  Update Account
                </GlossyButton>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Change Password</h3>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                </div>

                <GlossyButton onClick={handleChangePassword}>
                  Change Password
                </GlossyButton>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                {!showDeleteConfirm ? (
                  <GlossyButton
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <span className="inline-flex items-center ">
                      <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                    </span>
                  </GlossyButton>
                ) : (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">
                      Are you sure? This action cannot be undone. Your account will be deleted.
                    </p>
                    <div className="flex gap-2">
                      <GlossyButton
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete Account
                      </GlossyButton>
                      <GlossyButton
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </GlossyButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Preferences & Personalization</h2>

              {preferencesError && (
                <div className="text-red-400 text-sm">{preferencesError}</div>
              )}
              {preferencesSuccess && (
                <div className="text-green-400 text-sm">{preferencesSuccess}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Default Currency
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                    >
                      {popularCurrencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Or type currency"
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                      maxLength={3}
                      className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Number Format
                  </label>
                  <select
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                  >
                    <option value="1000">1000</option>
                    <option value="1,000">1,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <GlossyButton onClick={handleUpdatePreferences}>
                  Save Preferences
                </GlossyButton>
              </div>
            </div>
          </TabsContent>

          {/* Group Settings */}
          <TabsContent value="groups" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Group Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Select Group
                  </label>
                  <select
                    value={selectedGroupId || ""}
                    onChange={(e) => setSelectedGroupId(e.target.value || null)}
                    className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {groupSettings && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Pause Notifications</span>
                      <GlossyButton
                        onClick={() => handleToggleGroupNotifications(selectedGroupId!)}
                        className={groupSettings.notificationsPaused ? "bg-green-600" : ""}
                      >
                        {groupSettings.notificationsPaused ? "Resume" : "Pause"}
                      </GlossyButton>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Leave Group</span>
                      <GlossyButton
                        onClick={() => handleLeaveGroup(selectedGroupId!)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Leave
                      </GlossyButton>
                    </div>

                    {groupSettings.role === "ADMIN" && (
                      <div className="border-t border-white/10 pt-4 space-y-4">
                        <p className="text-green-400 font-semibold">Admin Options</p>
                        <p className="text-white/60 text-sm">
                          Admin settings are available on the group page. Go to the group to manage members, change roles, delete group, and set default split type.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Notification Settings</h2>

              {notificationsError && (
                <div className="text-red-400 text-sm">{notificationsError}</div>
              )}
              {notificationsSuccess && (
                <div className="text-green-400 text-sm">{notificationsSuccess}</div>
              )}

              {notificationSettings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Group Notifications</label>
                      <p className="text-white/60 text-sm">
                        Get notified when you're added to or removed from a group.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.groupEvents}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          groupEvents: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Expense Notifications</label>
                      <p className="text-white/60 text-sm">
                        Get notified when expenses are added, edited or deleted in your groups.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.expenseEvents}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          expenseEvents: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Group Invite Notifications</label>
                      <p className="text-white/60 text-sm">
                        Get notified when someone invites you to join a group.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.inviteEvents}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          inviteEvents: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Payment Due Notifications</label>
                      <p className="text-white/60 text-sm">
                        Get reminders when you owe money to others.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentDueEvents}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentDueEvents: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Payment Reminder Frequency
                    </label>
                    <select
                      value={notificationSettings.paymentReminderFrequency}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          paymentReminderFrequency: e.target.value,
                        })
                      }
                      className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="none">Never</option>
                    </select>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Do Not Disturb (Always)</label>
                        <p className="text-white/60 text-sm">
                          Silence all notifications permanently.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.doNotDisturbAlways}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            doNotDisturbAlways: e.target.checked,
                            doNotDisturbFrom: e.target.checked ? null : notificationSettings.doNotDisturbFrom,
                            doNotDisturbTo: e.target.checked ? null : notificationSettings.doNotDisturbTo,
                          })
                        }
                        className="w-5 h-5"
                      />
                    </div>

                    {!notificationSettings.doNotDisturbAlways && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                          Do Not Disturb Time Range
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={notificationSettings.doNotDisturbFrom || ""}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                doNotDisturbFrom: e.target.value,
                              })
                            }
                            className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                          />
                          <span className="text-white/60 self-center">to</span>
                          <input
                            type="time"
                            value={notificationSettings.doNotDisturbTo || ""}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                doNotDisturbTo: e.target.value,
                              })
                            }
                            className="flex-1 rounded-md bg-black/40 px-3 py-2 text-white outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <GlossyButton onClick={handleUpdateNotifications}>
                    Save Notification Settings
                  </GlossyButton>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payments / Settlements</h2>
              <p className="text-white/60">
                This feature is coming soon. You'll be able to pay group members directly from here.
              </p>
            </div>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support" className="space-y-6">
            <div className="bg-black/40 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Support & Help</h2>

              <div className="space-y-3">
                <GlossyButton
                  onClick={() => router.push("/dashboard/settings/support/contact")}
                  className="w-full justify-start"
                >
                  Contact Support
                </GlossyButton>

                <GlossyButton
                  onClick={() => router.push("/dashboard/settings/support/feature-request")}
                  className="w-full justify-start"
                >
                  Feature Request
                </GlossyButton>

                <GlossyButton
                  onClick={() => router.push("/dashboard/settings/support/bug-report")}
                  className="w-full justify-start"
                >
                  Report a Bug
                </GlossyButton>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/80">
                    <span className="font-medium">App Version:</span>{" "}
                    <span className="text-white/60">0.1.0</span>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

