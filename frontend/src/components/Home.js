import React, { useState, useEffect, useCallback } from 'react';
import PostCard from './PostCard';

function Home({ searchTerm }) {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts?page=${currentPage}&pageSize=${pageSize}`
      );
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('获取文章失败:', error);
      setPosts([]);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    const term = searchTerm.toLowerCase();
    return post.title.toLowerCase().includes(term) || 
           post.content.toLowerCase().includes(term) ||
           (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)));
  }) : [];

  return (
    <div className="home">
      <div className="posts-grid">
        {filteredPosts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <div className="no-results">
          没有找到相关文章
        </div>
      )}
      
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="page-button"
        >
          上一页
        </button>
        <span className="page-info">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
        <button 
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="page-button"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

export default Home; 