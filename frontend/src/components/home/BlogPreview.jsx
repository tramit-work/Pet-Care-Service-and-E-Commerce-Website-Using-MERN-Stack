import { useState } from 'react';
import BlogModal from './BlogModal';
import { blogPosts } from '../../mock/home.mock';

function BlogPreview() {
  const [openArticle, setOpenArticle] = useState(null);

  return (
    <div className="wrapper">
      <div className="section-title">
        <h1>Tin Tức Mới Nhất</h1>
        <p>Cập nhật các xu hướng chăm sóc thú cưng, sản phẩm mới và thông tin hữu ích cho Boss yêu của bạn.</p>
      </div>

      <div className="article-grid">
        {blogPosts.map((post) => (
          <div className="article-box" key={post.id}>
            <div className="image-container-new">
              <img src={post.image} alt={post.title} />
            </div>
            <div className="article-body">
              <time>{post.date}</time>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <div className="reading-time" onClick={() => setOpenArticle(post)}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 6v6l4 2" strokeWidth="2" />
                </svg>
                {post.readingTime}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BlogModal article={openArticle} onClose={() => setOpenArticle(null)} />
    </div>
  );
}

export default BlogPreview;
