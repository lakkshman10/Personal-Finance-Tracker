import React, { useEffect, useState } from 'react'; 
import axios from 'axios';

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6; // Number of blogs per page

  // Fetching data from API
  useEffect(() => {
    axios
      .get('https://newsdata.io/api/1/news?apikey=pub_59461f3f40b0cb9d31f4a62f88602b748abc7&q=finance&country=in&language=en')
      .then((response) => {
        console.log('Fetched blogs:', response.data.results); // Log API response
        const fetchedBlogs = response.data.results;
        fetchedBlogs.forEach(blog => {
          blog.imageUrl = blog.image_url || 'https://via.placeholder.com/300'; // Use placeholder if no image
        });
        setBlogs(fetchedBlogs);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      });
  }, []);

  // Filtering blogs based on search query
  const filteredBlogs = blogs.filter(blog =>
    (blog.title && blog.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (blog.description && blog.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  // Pagination Logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Pagination Controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Latest Finance News</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search news..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.blogGrid}>
        {currentBlogs.map((blog, index) => (
          <div key={index} style={styles.blogCard}>
            <img src={blog.imageUrl} alt="Blog" style={styles.blogImage} />
            <h2 style={styles.cardTitle}>{blog.title}</h2>
            <p style={styles.cardExcerpt}>
              {blog.description ? blog.description.substring(0, 100) : ''}...
            </p>
            <a href={blog.link} target="_blank" rel="noreferrer noopener" style={styles.link}>Read More</a>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div style={styles.pagination}>
        {Array.from({ length: Math.ceil(filteredBlogs.length / blogsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            style={styles.paginationButton}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontFamily: 'Rubik',
    color: '#4CAF50',
    fontSize: '2.4rem',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  },
  blogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  blogCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    margin: '10px 0',
    color: '#333',
    fontWeight: 'bold',
  },
  cardExcerpt: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '15px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'color 0.3s',
  },
  pagination: {
    textAlign: 'center',
    marginTop: '20px',
  },
  paginationButton: {
    padding: '10px 15px',
    margin: '0 5px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default Blog;
