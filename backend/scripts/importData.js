const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('已连接到数据库'))
.catch(err => console.error('数据库连接失败:', err));

// 文章模型
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

async function importData() {
  try {
    // 读取 db.json 文件
    const dbPath = path.join(__dirname, '..', 'data', 'db.json');
    const data = await fs.readFile(dbPath, 'utf8');
    const { posts } = JSON.parse(data);

    // 清空现有数据
    await Post.deleteMany({});
    console.log('已清空现有数据');

    // 导入数据
    const importedPosts = await Post.insertMany(posts.map(post => ({
      title: post.title,
      content: post.content,
      tags: post.tags || [],
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.createdAt)
    })));

    console.log(`成功导入 ${importedPosts.length} 篇文章`);
    
    // 验证导入
    const count = await Post.countDocuments();
    console.log(`数据库中现有 ${count} 篇文章`);

  } catch (error) {
    console.error('导入失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 运行导入
importData(); 