const mongoose = require('mongoose');

let connectionPromise = null;

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
    if (!uri.includes('@') && username && password) {
      uri = uri.replace('mongodb+srv://', `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@`);
    }
    if (uri.endsWith('.net/') || uri.endsWith('.net')) {
      const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
      uri = `${cleanUri}/spendwise?retryWrites=true&w=majority`;
    }
  }

  return uri;
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = getMongoUri();

  if (!uri) {
    console.warn('⚠️  MONGODB_URI is not defined. Database operations will fail until MONGODB_URI is configured.');
    return null;
  }

  connectionPromise = mongoose
    .connect(uri)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
