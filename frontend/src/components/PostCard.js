import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const PostCard = memo(({ post }) => {
  const getFirstImageUrl = (content) => {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = content.match(imageRegex);
    return match ? match[1] : null;
  };

  const getCleanContent = (content) => {
    return content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .replace(/\n/g, ' ')
      .trim();
  };

  const firstImageUrl = getFirstImageUrl(post.content);
  const cleanContent = getCleanContent(post.content);

  return (
    <Link to={`/post/${post._id}`} style={{ textDecoration: 'none' }}>
      <div className="post-card">
        {firstImageUrl && (
          <div className="post-image-container">
            <img className="post-image" src={firstImageUrl} alt={post.title} />
          </div>
        )}
        <div className="post-content-wrapper">
          <h3>{post.title}</h3>
          <div className="post-preview">
            {cleanContent.length > 200 
              ? cleanContent.substring(0, 200) + '...' 
              : cleanContent}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="post-meta">
            <small>{new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default PostCard; 
