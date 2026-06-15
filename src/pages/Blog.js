import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';
import '../styles/publicPages.css';

const POSTS = [
  { title: 'How to Ace Your Technical Interview', category: 'Career Tips', date: 'Jun 10, 2026', read: '5 min', excerpt: 'Prepare for coding interviews with these proven strategies from top tech companies.' },
  { title: 'Writing a Standout Resume in 2026', category: 'Resume Tips', date: 'Jun 8, 2026', read: '4 min', excerpt: 'Learn what recruiters really look for and how to make your resume stand out.' },
  { title: 'Remote Work: The Complete Guide', category: 'Remote Work', date: 'Jun 5, 2026', read: '7 min', excerpt: 'Everything you need to know about landing and thriving in a remote job.' },
  { title: 'Salary Negotiation 101', category: 'Career Tips', date: 'Jun 3, 2026', read: '6 min', excerpt: 'Know your worth and learn how to negotiate the salary you deserve.' },
  { title: 'Top 10 In-Demand Skills for 2026', category: 'Industry Trends', date: 'Jun 1, 2026', read: '5 min', excerpt: 'The skills employers are looking for this year and how to develop them.' },
  { title: 'Building Your Professional Network', category: 'Networking', date: 'May 28, 2026', read: '4 min', excerpt: 'Effective networking strategies for career growth in the digital age.' },
];

const Blog = () => (
  <div className="pp-page">
    <div className="pp-container">
      <div className="pp-page-header">
        <h1>Career Resources</h1>
        <p>Expert advice, guides, and insights to help you navigate your career journey.</p>
      </div>

      <div className="pp-blog-grid">
        {POSTS.map((post, i) => (
          <article key={i} className="pp-blog-card">
            <div className="pp-blog-card-top">
              <span className="pp-tag"><Tag size={11} /> {post.category}</span>
              <span className="pp-meta-item"><Clock size={12} /> {post.read}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="pp-blog-card-footer">
              <span className="pp-muted">{post.date}</span>
              <span className="pp-link">Read More <ArrowRight size={13} /></span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default Blog;
