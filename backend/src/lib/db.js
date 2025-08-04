import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URL}/chatty`);
    console.log(`Mongo DB connceted: ${conn.connection.host}/chatty`);
  } catch (error) {
    console.log(`Mongo db Conncetion error:`, error);
  }
};

export default connectDB;
