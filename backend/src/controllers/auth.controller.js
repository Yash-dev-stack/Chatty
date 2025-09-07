import cloudinary from "../lib/cloudinary.js";
import generateToken from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Controller for registering a user
const signup = async (request, response) => {
  try {
    console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY);

    const { fullName, email, password } = request.body;

    // Check all fields are properly received from frontend
    if (!email || !password || !fullName) {
      return response.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate the password length
    if (password.length < 6) {
      return response.status(400).json({
        success: false,
        message: "Passsword length must be greater than 6 characters.",
      });
    }

    // Check if user is already registered or not
    const user = await User.findOne({ email });

    if (user) {
      return response.status(400).json({
        success: false,
        message: "User with this email is already registrerd",
      });
    }

    // Hashed the password before saving to database
    const salt = await bcrypt.genSalt(9);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    //  if user create successfully then generate the jwt token and send the response
    if (newUser) {
      // Generate jwt token
      await newUser.save();
      generateToken(newUser._id, response);

      response.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      response
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Controller for login a user
const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    //  Check all fields are received from frontend
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check is user is registered or not
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(400).json({
        success: false,
        message: "User is not registered with this email",
      });
    }

    // Matching the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // console.log("isPasswordCorrect", isPasswordCorrect);

    // If password is correct
    if (!isPasswordCorrect) {
      return response.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate the token
    generateToken(user._id, response);

    return response.status(200).json({
      success: true,
      message: `Welcome ${user.fullName}`,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Controller for logout a user
const logout = (_, response) => {
  try {
    // Delete the cookie
    response.cookie("token", "", { maxAge: 0 });

    response.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.log("Error in logout controller: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Controller for update the user profile
const updateProfile = async (request, response) => {
  try {
    const { profilePic } = request.body;
    const userId = request.user._id;

    if (!profilePic) {
      return response.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    response.status(200).json({
      success: true,
      message: "User information updated successfully.",
      updatedUser,
    });
  } catch (error) {
    console.log("Error in update profile controller: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Controller for check the authentication of user
const checkAuth = async (request, response) => {
  try {
    response.status(200).json(request.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Export all the controllers
export { signup, login, logout, updateProfile, checkAuth };
