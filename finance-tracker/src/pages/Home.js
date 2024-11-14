// src/pages/Home.js
import React from 'react';
import heroImage from '../assets/hero-image.png';

function Home() {
  return (
    <div style={styles.container}>
      {/* Hero Section with Double Column Layout */}
      <section style={styles.heroSection}>
        {/* Left Column (Image) */}
        <div style={styles.imageContainer}>
          <img src={heroImage} alt="Finance management" style={styles.heroImage} />
        </div>

        {/* Right Column (Text) */}
        <div style={styles.textContainer}>
          <h1 style={styles.heading}>Welcome to ExpenseMate</h1>
          <p style={styles.paragraph}>Your finances, simplified. Track your spending, save smarter, and achieve your financial goals.</p>
          <p style={styles.paragraph2}>With ExpenseMate, managing your finances has never been easier. Whether you're planning for the future or analyzing your daily expenses, our intuitive tools help you make informed decisions. Get started today and take control of your financial journey.</p>
        </div>
      </section>

      {/* Additional Sections */}
      <section style={styles.introSection}>
        <h2>Why Choose ExpenseMate?</h2>
        <p>
          ExpenseMate is designed to make managing finances easy, with features that let you track expenses, visualize spending trends, 
          and plan for your financial future.
        </p>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2>Features Overview</h2>
        <ul>
          <li>📊 Easy Expense Tracking</li>
          <li>📈 Detailed Reports and Analytics</li>
          <li>🔒 Secure Login and Data Protection</li>
          <li>📅 Budget Planning Tools</li>
        </ul>
      </section>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Rubik", sans-serif',
    padding: '0 20px',
    color: '#333',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'row',   // Align image and text side by side
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    gap: '20px',            // Space between image and text
    padding: '20px',
    flexWrap: 'wrap',       // Make sure it wraps on small screens
  },
  imageContainer: {
    flex: 1,               // Take up equal space as text container
    maxWidth: '50%',       // Limit width of image container
  },
  heroImage: {
    width: '100%',         // Make image fill container
    height: 'auto',        // Maintain aspect ratio
    objectFit: 'cover',    // Ensure the image scales correctly
    borderRadius: '8px',
  },
  textContainer: {
    flex: 1,               // Take up equal space as image container
    maxWidth: '50%',       // Limit width of text container
    padding: '20px',
    textAlign: 'left',     // Align text to the left for readability
  },
  heading: {
    fontSize: '3rem', // Bigger size for the heading
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '20px', // Space below the heading
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)', // Slight shadow for a more dynamic look
  },
  paragraph: {
    fontSize: '1.3rem', // Make the text readable but not too large
    color: '#666',
    lineHeight: '1.8', // Makes it easier to read
    maxWidth: '800px', // Limit the paragraph width to avoid it stretching too far
    marginBottom: '30px', // Adds space below the paragraph
  },
  paragraph2: {
    fontSize: '1rem', // Make the text readable but not too large
    color: 'black',
    lineHeight: '1.8', // Makes it easier to read
    maxWidth: '800px', // Limit the paragraph width to avoid it stretching too far
    marginBottom: '30px', // Adds space below the paragraph
  },
  introSection: {
    marginTop: '40px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#F5F5F5',
    borderRadius: '8px',
  },
  featuresSection: {
    marginTop: '30px',
    padding: '10px',
    textAlign: 'center',
  },
};

export default Home;
