import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (request, response, next) => {
  try {
    // Grab the token from coookie
    const token = request.cookies.token;

    // Check we received the token properly
    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized -No token is provided",
      });
    }

    // Decode the token
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check if we successfully decode the token
    if (!decodeToken) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized Invalid token",
      });
    }

    // Find the user from database
    const user = await User.findById(decodeToken.userId).select("-password");

    // If user is not found return the error
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Save the user
    request.user = user;

    // Calling the next function
    next();
  } catch (error) {
    console.log("Error in protectedroute middleware: ", error);
    return response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { protectRoute };
