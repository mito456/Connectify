import Notification from "../models/Notification.js";

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // 'all', 'likes', 'comments', 'follows'

    let query = { recipient: userId };
    
    if (filter === 'likes') query.type = 'like';
    else if (filter === 'comments') query.type = 'comment';
    else if (filter === 'follows') query.type = 'follow';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ msg: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    res.json({ msg: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ msg: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Create notification (helper function used by other controllers)
export const createNotification = async (data) => {
  try {
    // Don't create notification if sender and recipient are same
    if (data.sender === data.recipient) return;

    // Check if similar notification exists recently (within 1 hour)
    const recentNotification = await Notification.findOne({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      postId: data.postId || "",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    // If exists, just update the timestamp instead of creating duplicate
    if (recentNotification) {
      recentNotification.createdAt = new Date();
      recentNotification.read = false;
      await recentNotification.save();
      return recentNotification;
    }

    // Create new notification
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
};
