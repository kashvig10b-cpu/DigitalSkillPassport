const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let memoryServer = null;

const findCachedMongod = () => {
  const possibleDirs = [
    path.join(process.env.USERPROFILE || 'C:\\Users\\DELL', '.cache', 'mongodb-binaries'),
    path.join(process.env.LOCALAPPDATA || 'C:\\Users\\DELL\\AppData\\Local', 'mongodb-binaries'),
  ];
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const exe = files.find((f) => f.startsWith('mongod') && f.endsWith('.exe'));
      if (exe) return path.join(dir, exe);
    }
  }
  return null;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_skill_passport';

  // Step 1: Try connecting directly if mongod is already running (from a previous server session)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected to persistent database: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.log(`[MongoDB] Port 27017 not active. Starting persistent local MongoDB engine...`);
  }

  // Step 2: Auto-start local mongod process (detached so it outlives the Node server)
  const mongodExe = findCachedMongod();
  if (mongodExe) {
    try {
      const dbDir = path.join(__dirname, '../data/db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Clear stale lock file if it exists (leftover from unclean shutdown)
      const lockFile = path.join(dbDir, 'mongod.lock');
      if (fs.existsSync(lockFile)) {
        try {
          const lockContent = fs.readFileSync(lockFile, 'utf8').trim();
          if (lockContent) {
            console.log('[MongoDB] Clearing stale lock file from previous session...');
            fs.writeFileSync(lockFile, '');
          }
        } catch (e) {}
      }

      console.log(`[MongoDB] Launching ${path.basename(mongodExe)} with data at: ${dbDir}`);

      // Spawn detached so mongod continues running after this Node process exits
      // This is the KEY change: mongod persists across server restarts
      const mongodProc = spawn(mongodExe, [
        '--dbpath', dbDir,
        '--port', '27017',
        '--bind_ip', '127.0.0.1',
      ], {
        stdio: 'ignore',
        detached: true,   // <-- mongod runs independently of the Node process
      });
      mongodProc.unref();  // <-- Node process won't wait for mongod to exit

      // Wait up to 10 seconds for mongod to initialize and accept connections
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 400));
        try {
          const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 1000 });
          console.log(`[MongoDB] Persistent database ready! (Data saved to disk — accounts survive restarts)`);
          return conn;
        } catch (e) {
          // Keep retrying until mongod is ready
        }
      }

      console.error('[MongoDB] Timed out waiting for mongod to become ready.');
    } catch (launchErr) {
      console.warn('[MongoDB] Could not launch mongod binary:', launchErr.message);
    }
  }

  // Step 3: Fallback to MongoMemoryServer if no cached binary is available
  try {
    console.log('[MongoDB] Falling back to in-memory MongoDB (data will NOT persist across restarts)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri() + 'digital_skill_passport';
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] In-Memory MongoDB started at ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error('[MongoDB] Fatal: Could not establish any database connection:', memErr.message);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  // NOTE: We intentionally do NOT stop mongod here.
  // The mongod process is detached and will keep running in the background,
  // so the next time the server starts it connects instantly without re-spawning.
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
