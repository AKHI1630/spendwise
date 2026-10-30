const mongoose = require('mongoose');

let isConnected = false;

const getMongoUri = () => {
  let uri = process.env.MONGODB_URI || '';
  const username = process.env.MONGODB_USERNAME || process.env.DB_USERNAME || 'smallidi_db_user';
  const password = process.env.MONGODB_PASSWORD || process.env.DB_PASSWORD || '';

  if (uri) {
    if (username && (uri.includes('<db_username>') || uri.includes('<username>'))) {
      uri = uri.replace('<db_username>', encodeURIComponent(username)).replace('<username>', encodeURIComponent(username));
    }
    if (password && (uri.includes('<db_password>') || uri.includes('<password>'))) {
      uri = uri.replace('<db_password>', encodeURIComponent(password)).replace('<password>', encodeURIComponent(password));
    }
    // If user provided raw cluster like mongodb+srv://cluster0...
    if (!uri.includes('@') && username && password) {
      uri = uri.replace('mongodb+srv://', `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@`);
    }
    // Ensure database name is present
    if (uri.endsWith('.net/') || uri.endsWith('.net')) {
      const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
      uri = `${cleanUri}/spendwise?retryWrites=true&w=majority`;
    }
  }

  return uri;
};

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = getMongoUri();

  if (!uri) {
    console.warn('⚠️  MONGODB_URI is not defined. Database operations will fail until MONGODB_URI is configured.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
