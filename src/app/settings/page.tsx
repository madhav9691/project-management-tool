"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Bell, Palette, Database } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    companyName: "",
    timezone: "UTC",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    weeklyReports: true,
    theme: "light",
  });

  function handleSave() {
    // In a real app, this would save to the database
    alert("Settings saved successfully!");
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your application preferences
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "general"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "notifications"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "appearance"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "data"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Data
        </button>
      </div>

      {/* Content */}
      <div className="card">
        <div className="card-body">
          {activeTab === "general" && (
            <div className="space-y-4 max-w-2xl">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                  placeholder="Your company name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-input"
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select
                  className="form-input"
                  value={settings.dateFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, dateFormat: e.target.value })
                  }
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive email updates for project changes
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-sm text-gray-500">
                      Receive weekly project summary reports
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.weeklyReports}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weeklyReports: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-4 max-w-2xl">
              <div className="form-group">
                <label className="form-label">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, theme: "light" })}
                    className={`p-4 border-2 rounded-lg text-center ${
                      settings.theme === "light"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="w-full h-12 bg-white rounded mb-2 border border-gray-200"></div>
                    <p className="font-medium text-gray-900">Light</p>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: "dark" })}
                    className={`p-4 border-2 rounded-lg text-center ${
                      settings.theme === "dark"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="w-full h-12 bg-gray-800 rounded mb-2 border border-gray-700"></div>
                    <p className="font-medium text-gray-900">Dark</p>
                  </button>
                  <button
                    onClick={() =>
                      setSettings({ ...settings, theme: "system" })
                    }
                    className={`p-4 border-2 rounded-lg text-center ${
                      settings.theme === "system"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="w-full h-12 bg-gradient-to-r from-white to-gray-800 rounded mb-2 border border-gray-200"></div>
                    <p className="font-medium text-gray-900">System</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    Data Management
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Manage your project data, export reports, and backup your
                  information.
                </p>
                <div className="flex gap-3">
                  <button className="btn btn-secondary text-sm">
                    Export All Data
                  </button>
                  <button className="btn btn-secondary text-sm">
                    Import Data
                  </button>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Irreversible and destructive actions. Be careful!
                </p>
                <button className="btn btn-danger text-sm">
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
