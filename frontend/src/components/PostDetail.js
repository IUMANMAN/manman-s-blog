import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PostDetail.css';
import ReactMarkdown from 'react-markdown';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

 

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('文章不存在');
      }
      const data = await response.json();
      setPost(data);
      setError(null);
    } catch (error) {
      console.error('获取文章详情失败:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>出错了</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">
          返回首页
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <h2>文章不存在</h2>
        <button onClick={() => navigate('/')} className="back-button">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleString()}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default PostDetail; 