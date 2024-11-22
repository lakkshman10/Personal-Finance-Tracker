import React from 'react';
import { FaRegCheckCircle, FaLock, FaDollarSign, FaRocket } from 'react-icons/fa';
import heroImage from '../assets/hero-image.png';
import featureImage from '../assets/featuresection.png'; // Feature image for Features Overview section

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

      {/* Why Choose ExpenseMate? */}
      <section style={styles.introSection}>
        <h2 style={styles.heading2}>Why Choose ExpenseMate?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <FaRegCheckCircle style={styles.icon} />
            <h3 style={styles.featureTitle}>Simple and Easy to Use</h3>
            <p style={styles.featureText}>
              Our user-friendly interface makes managing your finances a breeze. ExpenseMate simplifies complex financial tasks with easy navigation and intuitive controls.
            </p>
          </div>
          <div style={styles.featureCard}>
            <FaLock style={styles.icon} />
            <h3 style={styles.featureTitle}>Top-Notch Security</h3>
            <p style={styles.featureText}>
              Your data is safe with us. We use advanced encryption technologies to ensure your financial information is always protected.
            </p>
          </div>
          <div style={styles.featureCard}>
            <FaDollarSign style={styles.icon} />
            <h3 style={styles.featureTitle}>Cost-Effective</h3>
            <p style={styles.featureText}>
              ExpenseMate is free to use, offering value-packed features without the need for paid plans. You get all the tools to manage your finances at no cost.
            </p>
          </div>
          <div style={styles.featureCard}>
            <FaRocket style={styles.icon} />
            <h3 style={styles.featureTitle}>Innovative Features</h3>
            <p style={styles.featureText}>
              Take control with innovative features such as real-time updates, budget tracking, and in-depth spending analysis to help you make smarter financial decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
  <h2 style={styles.heading2}>Features Overview</h2>
  <div style={styles.featuresWrapper}>
    {/* Left Column (Image) */}
    <div style={styles.imageColumn}>
      <img src={featureImage} alt="Features" style={styles.featureImage} />
    </div>

    {/* Right Column (Text) */}
    <div style={styles.textColumn}>
      <ul style={styles.featureList}>
        <li style={styles.listheading}>📊 Easy Expense Tracking</li>
        <p>Track every expense effortlessly with automatic categorization, keeping you organized without manual entry. Stay in control of your finances every day.</p>

        <li style={styles.listheading}>📈 Detailed Reports and Analytics</li>
        <p>Get comprehensive insights into your spending habits over time, helping you identify trends and make smarter financial decisions.</p>

        <li style={styles.listheading}>🔒 Secure Login and Data Protection</li>
        <p>Your financial data is safeguarded with top-tier encryption and secure login, ensuring peace of mind when managing your money.</p>

        <li style={styles.listheading}>📅 Budget Planning Tools</li>
        <p>Set budgets for different categories and track your progress to avoid overspending, ensuring you're always on top of your finances.</p>
      </ul>
    </div>
  </div>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    gap: '20px',
    padding: '20px',
    flexWrap: 'wrap',
  },
  imageContainer: {
    flex: 1,
    maxWidth: '50%',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  textContainer: {
    flex: 1,
    maxWidth: '50%',
    padding: '20px',
    textAlign: 'left',
  },
  heading: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  paragraph: {
    fontSize: '1.3rem',
    color: '#666',
    lineHeight: '1.8',
    maxWidth: '800px',
    marginBottom: '30px',
  },
  paragraph2: {
    fontSize: '1rem',
    color: 'black',
    lineHeight: '1.8',
    maxWidth: '800px',
    marginBottom: '30px',
  },
  introSection: {
    marginTop: '40px',
    marginBottom: '40px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#F5F5F5',
    borderRadius: '8px',
  },
  heading2: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  featuresGrid: {
    display: 'flex',               // Use flexbox to keep items in one line
    justifyContent: 'space-between', // Distribute space between items
    gap: '20px',                   // Add space between cards
    flexWrap: 'wrap',              // Allow wrapping on small screens
    marginTop: '40px',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    flex: 1,                      // Allow cards to take equal space
    minWidth: '220px',            // Ensure cards don't shrink too small
  },
  icon: {
    fontSize: '3rem',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '15px',
  },
  featureText: {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: '1.6',
  },
  featuresSection: {
    marginTop: '20px',
    padding: '10px',
    textAlign: 'center',
  },
  featuresWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '40px',
  },
  imageColumn: {
    flex: 1,
    maxWidth: '50%',
    marginBottom: '40px',
  },
  featureImage: {
    width: '70%',
    height: 'auto',             // Maintains aspect ratio
    objectFit: 'contain',       // Shrinks the image to fit within its container
    borderRadius: '8px',        // Optional, to give rounded corners to the image
  },
  textColumn: {
    flex: 1,
    maxWidth: '50%',
    textAlign: 'left',
  },
  featureList: {
    fontSize: '1.2rem',
    color: '#333',
    listStyleType: 'none',
    paddingLeft: '0',
  },
  listheading:{
    color: '#4CAF50',
  }
};

export default Home;
