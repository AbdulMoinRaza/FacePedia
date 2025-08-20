import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      //friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      //friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
import bcrypt from "bcrypt";
/* UPDATE USER PROFILE */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle optional image upload
    if (req.file) {
      updates.picturePath = req.file.filename; // or use `req.file.path` if storing full path
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(updates.password, salt);
    updates.password = passwordHash;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addNotification = async (req, res) => {
    const { userId } = req.params;
    const { type, message, postId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newNotification = {
            type,
            message,
            postId,
            seen: false,
            timestamp: new Date()
        };

        user.notifications.push(newNotification);
        await user.save();

        res.status(200).json({ message: "Notification added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const markNotificationAsSeen = async (req, res) => {
  const { userId, notificationId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the notification by ID
    user.notifications.pull(notificationId);

    // Save the user
    await user.save();

    res.status(200).json({ message: "Notification marked as seen and deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      //res.status(200).json(user.notifications);
      const unseenNotifications = user.notifications.filter(notification => !notification.seen);

      res.status(200).json(unseenNotifications);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const deleteNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      user.notifications = [];
      await user.save();

      res.status(200).json({ message: "All notifications deleted" });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getSuggestions = async (req, res) => {
  const { query } = req.query;
  console.log('Suggestions back end --> ',query)

  try {
      const users = await User.find({
          $or: [
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
          ],
      }).select('firstName lastName _id'); // Return only relevant fields
      res.status(200).json(users);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}
