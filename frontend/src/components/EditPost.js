import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = `http://localhost:5000${data.url}`;
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        setUploadedImages(prev => [...prev, { 
          name: file.name, 
          url: imageUrl, 
          markdown: imageMarkdown 
        }]);
      }
    } catch (error) {
      console.error('上传图片失败:', error);
    }
  };

  const insertImageToEditor = (markdown) => {
    const textArea = document.querySelector('.markdown-editor textarea');
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const newContent = content.substring(0, start) + '\n' + markdown + '\n' + content.substring(end);
    setContent(newContent);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, content, tags }),
      });
      await response.json();
      window.location.href = '/';
    } catch (error) {
      console.error('发布文章失败:', error);
    }
  };

  return (
    <div className="edit-post">
      <div className="edit-container">
        <h2>发布新文章</h2>
        <form onSubmit={handleSubmit}>
          <div className="title-section">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              required
              className="title-input"
            />
          </div>
          
          <div className="editor-container">
            <div className="editor-section">
              <div className="editor-toolbar">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="image-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="toolbar-button">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/>
                  </svg>
                  插入图片
                </label>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="使用 Markdown 格式编写文章内容"
                required
                className="content-editor"
              />
            </div>

            <div className="preview-section">
              <h3>预览</h3>
              <div className="preview-content">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </div>

          {uploadedImages.length > 0 && (
            <div className="uploaded-images">
              <h4>已上传的图片</h4>
              <div className="image-grid">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image.url} alt={image.name} className="thumbnail" />
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <div className="image-actions">
                        <button
                          type="button"
                          onClick={() => insertImageToEditor(image.markdown)}
                          className="insert-button"
                        >
                          插入
                        </button>
                        <input
                          type="text"
                          value={image.markdown}
                          readOnly
                          className="image-markdown"
                          onClick={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tag-section">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="输入标签，按回车或逗号添加"
              className="tag-input"
            />
            <div className="tags">
              {tags.map((tag, index) => (
                <span key={index} className="tag" onClick={() => removeTag(tag)}>
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div className="submit-section">
            <button type="submit" className="submit-button">发布文章</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost; 