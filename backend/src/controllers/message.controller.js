import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

//  Controller for get sidebar users
const getUserForSidebar = async (request, response) => {
  try {
    // Take user id of logged in user
    const loggedInUserId = request.user._id;

    //  Filter all the user expect logged in user
    const filterUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    // Return all the filtered user
    return response.status(200).json(filterUsers);
  } catch (error) {
    console.log("Error for get sidebar user: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Controller for get messages
const getMessages = async (request, response) => {
  try {
    const { id: userToChatId } = request.params;

    const senderId = request.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    });

    return response.status(200).json(messages);
  } catch (error) {
    console.log("Error for get user messages: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const sendMessages = async (request, response) => {
  try {
    const { text, image } = request.body;
    const { id: receiverId } = request.params;
    const senderId = request.user._id;

    let imageUrl;

    if (image) {
      //  Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //  real time functionality => socket.io

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return response.status(201).json(newMessage);
  } catch (error) {
    console.log("Error for send messages: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export { getUserForSidebar, getMessages, sendMessages };
