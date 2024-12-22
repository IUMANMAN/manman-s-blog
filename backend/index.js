const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('成功连接到 MongoDB');
})
.catch((error) => {
  console.error('MongoDB 连接失败:', error);
  console.error('错误详情:', error.message);
});

// 监听数据库连接状态
mongoose.connection.on('connected', () => {
  console.log('Mongoose 已连接');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose 连接错误:', err);
  console.error('错误类型:', err.name);
  console.error('错误消息:', err.message);
  if (err.stack) {
    console.error('错误堆栈:', err.stack);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 连接断开');
});

// 添加健康检查接口
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: '已断开',
    1: '已连接',
    2: '正在连接',
    3: '正在断开'
  };
  
  res.json({
    database: {
      state: states[dbState],
      connected: dbState === 1
    },
    server: 'running'
  });
});

// 文章模型
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 添加索引以提高查询性能
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);

// 添加固定的账户信息
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '111111'; // 设置你的密码
const JWT_SECRET = 'your_jwt_secret_here'; // 设置一个复杂的密钥

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: 'uploads/',  // 图片保存路径
  limits: {
    fileSize: 5 * 1024 * 1024  // 限制5MB
  }
});

// 添加验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的token' });
    }
    req.user = user;
    next();
  });
};

// API路由
app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    
    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    
    res.json({
      posts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags
    });
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: '创建文章失败' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: '文章不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 图片模型
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

// 添加登录路由
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

// 图片上传路由
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
    await image.save();
    res.json({ url: image.path });
  } catch (error) {
    res.status(500).json({ error: '上传失败' });
  }
});

// 提供静态文件访问
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`服务器运行在端口: ${port}`);
}); 