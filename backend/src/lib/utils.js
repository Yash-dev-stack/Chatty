import jwt from "jsonwebtoken";

const generateToken = (userId, response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  response.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // It prevent XSS attacks cross site scripting attacks
    sameSite: "strict", //  CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};

export default generateToken;
