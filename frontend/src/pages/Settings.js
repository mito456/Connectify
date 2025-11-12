import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  const [accountSettings, setAccountSettings] = useState({
    email: currentUser.email,
    name: currentUser.name
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    allowMessages: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true
  });

  const handleAccountChange = (e) => {
    setAccountSettings({ ...accountSettings, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleNotificationChange = (e) => {
    setNotificationSettings({
      ...notificationSettings,
      [e.target.name]: e.target.checked
    });
  };

  const saveAccountSettings = () => {
    const updatedUser = { ...currentUser, ...accountSettings };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("✅ Account settings saved!");
  };

  const changePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("❌ Passwords don't match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("❌ Password must be at least 6 characters!");
      return;
    }
    alert("✅ Password changed successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const savePrivacySettings = () => {
    alert("✅ Privacy settings saved!");
  };

  const saveNotificationSettings = () => {
    alert("✅ Notification settings saved!");
  };

  const deleteAccount = () => {
    if (window.confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone!")) {
      localStorage.clear();
      navigate("/register");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="settings-container">
        <h2 style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "30px" }}>
          ⚙️ Settings
        </h2>

        {/* Account Settings */}
        <div className="settings-section">
          <h3 className="settings-title">👤 Account Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={accountSettings.name}
                onChange={handleAccountChange}
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={accountSettings.email}
                onChange={handleAccountChange}
                className="settings-input"
              />
            </div>
            <button onClick={saveAccountSettings} className="save-btn">💾 Save Changes</button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="settings-section">
          <h3 className="settings-title">🔐 Change Password</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="settings-input"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="settings-input"
              />
            </div>
            <button onClick={changePassword} className="save-btn">🔑 Update Password</button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <h3 className="settings-title">🔒 Privacy Settings</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Profile Visibility</label>
              <select
                name="profileVisibility"
                value={privacySettings.profileVisibility}
                onChange={handlePrivacyChange}
                className="settings-input"
              >
                <option value="public">🌐 Public</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={privacySettings.showEmail}
                  onChange={handlePrivacyChange}
                />
                <span>Show email on profile</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allowMessages"
                  checked={privacySettings.allowMessages}
                  onChange={handlePrivacyChange}
                />
                <span>Allow messages from anyone</span>
              </label>
            </div>
            <button onClick={savePrivacySettings} className="save-btn">💾 Save Privacy Settings</button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h3 className="settings-title">🔔 Notification Preferences</h3>
          <div className="settings-form">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <span>📧 Email Notifications</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onChange={handleNotificationChange}
                />
                <span>🔔 Push Notifications</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="likeNotifications"
                  checked={notificationSettings.likeNotifications}
                  onChange={handleNotificationChange}
                />
                <span>❤️ Likes</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="commentNotifications"
                  checked={notificationSettings.commentNotifications}
                  onChange={handleNotificationChange}
                />
                <span>💬 Comments</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="followNotifications"
                  checked={notificationSettings.followNotifications}
                  onChange={handleNotificationChange}
                />
                <span>👥 New Followers</span>
              </label>
            </div>
            <button onClick={saveNotificationSettings} className="save-btn">💾 Save Notification Settings</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3 className="settings-title">⚠️ Danger Zone</h3>
          <div className="settings-form">
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button onClick={deleteAccount} className="delete-account-btn">
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
