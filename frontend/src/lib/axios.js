import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chatty-backend-96zo.onrender.com/api",
  withCredentials: true,
});
