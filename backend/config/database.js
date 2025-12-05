
import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri, {
      autoIndex: true
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
