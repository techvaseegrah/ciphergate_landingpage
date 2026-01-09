const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const socketIo = require('socket.io');

// Load env vars first
dotenv.config();

// Enhanced error handling for database connection
const startServer = async () => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    const app = express();
    const server = http.createServer(app);

    const corsOptions = {
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',  // Add the port that Vite is using
          'https://tvtasks.netlify.app',
          'https://techvaseegrah.ciphergate.in',
        ];
        const regex = /^http:\/\/.*\.localhost:3000$/; // Allow subdomains of localhost:3000

        if (!origin || allowedOrigins.includes(origin) || regex.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    };

    // Apply CORS middleware
    app.use(cors(corsOptions));

    // Handle preflight requests globally
    app.options('*', cors(corsOptions));

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Serve static files from uploads directory
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Routes

    const authRoutes = require('./routes/authRoutes');
    const attendanceRoutes = require('./routes/attedanceRoutes');
    const workerRoutes = require('./routes/workerRoutes');
    const adminRoutes = require('./routes/adminRoutes');

    const leaveRoutes = require('./routes/leaveRoutes');
    const departmentRoutes = require('./routes/departmentRoutes');

    const notificationRoutes = require('./routes/notificationRoutes');
    const salaryRoutes = require('./routes/salaryRoutes');
    const settingsRoutes = require('./routes/settingsRoutes');
    const holidayRoutes = require('./routes/holidayRoutes');
    const fineRoutes = require('./routes/fineRoutes'); // ADD THIS

    // Test App routes
    const learningTopicRoutes = require('./routes/learningTopicRoutes');

    // Job routes
    const jobRoutes = require('./routes/jobRoutes');
    
    // AI routes
    const aiRoutes = require('./routes/aiRoutes');
    
    // Mount routes

    app.use('/api/auth', authRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/workers', workerRoutes);
    app.use('/api/salary', salaryRoutes);
    app.use('/api/admin', adminRoutes);

    app.use('/api/leaves', leaveRoutes);
    app.use('/api/departments', departmentRoutes);

    app.use('/api/notifications', notificationRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/holidays', holidayRoutes);
    app.use('/api/fines', fineRoutes); // ADD THIS

    // Test App routes
    app.use('/api/test/topics', learningTopicRoutes);

    // Job routes
    app.use('/api/jobs', jobRoutes);
    
    // AI routes
    app.use('/api/ai', aiRoutes);
    
    // Route for checking API status

    app.get('/', (req, res) => {
      res.json({ message: 'Task Tracker API is running' });
    });
    
    // Initialize Socket.IO for real-time communication
    const io = socketIo(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://tvtasks.netlify.app',
          'https://techvaseegrah.ciphergate.in',
        ],
        methods: ['GET', 'POST']
      }
    });
    
    io.on('connection', (socket) => {
      console.log('New client connected to Socket.IO for contact form');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected from Socket.IO');
      });
    });

    // Initialize schedulers and cron jobs
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULERS === 'true') {
      console.log('🚀 Starting production schedulers...');

      // Initialize food request schedulers
      const { initializeFoodRequestSchedulers } = require('./schedulers/foodRequestScheduler');
      initializeFoodRequestSchedulers();

      // Initialize other cron jobs if they exist
      const { startCronJobs } = require('./services/cronJobs');
      startCronJobs();
    } else {
      console.log('⚠️ Schedulers disabled. Set NODE_ENV=production or ENABLE_SCHEDULERS=true to enable');
    }

    // Error handler (should be last)
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
      console.log(`🗄️ Database: Connected successfully`);
      console.log(`💬 Socket.IO: Real-time communication enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection error:', error.message);
    console.error('🔧 Troubleshooting steps:');
    console.error('1. Verify your MongoDB Atlas credentials in the .env file');
    console.error('2. Check if your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('3. Ensure your MongoDB user has proper permissions');
    console.error('4. If using special characters in password, URL encode them');
    console.error('5. Try creating a new database user with a simple password');
    console.error('6. Refer to MONGODB_TROUBLESHOOTING.md for detailed instructions');

    // Exit the process as we can't start the server without a database connection
    process.exit(1);
  }
};

// Start the server
startServer();