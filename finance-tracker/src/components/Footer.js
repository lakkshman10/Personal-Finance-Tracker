import React from 'react';
import { FaFacebookF, FaTwitter, FaGoogle, FaInstagram, FaYoutube,} from 'react-icons/fa';

function Footer() {
  const styles = {
    footerWrapper: {
      width: '100%', // Ensure the footer takes up the full width
      backgroundColor: '#1c2331',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    },
    socialMediaSection: {
      backgroundColor: '#4CAF50',
      padding: '10px 20px',
      fontFamily: 'Rubik',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    socialText: {
      //marginLeft: '20px',
    },
    socialIcons: {
      display: 'flex',
      gap: '30px',
      padding: '0px 30px',
    },
    socialIcon: {
      color: 'white',
      fontSize: '1.2rem',
      textDecoration: 'none',
    },
    footerLinks: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Align to top for better spacing
      padding: '20px 40px', // Added padding for a clean look
      flexWrap: 'wrap', // Allows wrapping on smaller screens
      gap: '20px', // Spacing between sections
    },
    footerColumn: {
      flex: '1',
      minWidth: '180px', // Ensures columns have a consistent width
      margin: '0 10px', // Reduced margins for compactness
    },
    footerColumnH2: {
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    footerLink: {
      color: 'white',
      textDecoration: 'none',
    },
    footerLinkHover: {
      color: '#7c4dff', // Color when hovered
    },
    footerCopyright: {
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: '15px 0',
    },
    newsletterInput: {
      marginBottom: '10px',
      display: 'flex',
      flexDirection: 'column',
    },
    inputField: {
      padding: '8px',
      width: '100%',
      fontSize: '0.9rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      marginBottom: '10px',
    },
    subscribeButton: {
      padding: '10px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      textAlign: 'center',
    },
    subscribeButtonHover: {
      backgroundColor: '#45a049',
    },
  };

  return (
    <div style={styles.footerWrapper}>
      {/* Footer Section */}
      <footer>
        {/* Social Media Section */}
        <section style={styles.socialMediaSection}>
          <div style={styles.socialText}>
            <span>Get connected with us on social networks:</span>
          </div>
          <div style={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <FaTwitter />
            </a>
            <a href="https://google.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <FaGoogle />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={styles.socialIcon}>
              <FaYoutube />
            </a>

          </div>
        </section>

        {/* Links Section */}
        <section style={styles.footerLinks}>
          <div style={styles.footerColumn}>
            <h2 style={styles.footerColumnH2}>ExpenseMate</h2>
            <p>
            Your finances, simplified. Track your spending, save smarter, and achieve your financial goals
            </p>
          </div>

          <div style={styles.footerColumn}>
            <h2 style={styles.footerColumnH2}>Explore</h2>
            <p>
              <a href="#!" style={styles.footerLink}>Your Account</a>
            </p>
            <p>
              <a href="#!" style={styles.footerLink}>Budgeting Tips</a>
            </p>
            <p>
              <a href="#!" style={styles.footerLink}>Investment Strategies</a>
            </p>
            <p>
              <a href="#!" style={styles.footerLink}>Privacy Policy</a>
            </p>
          </div>
          <div style={styles.footerColumn}>
            <h2 style={styles.footerColumnH2}>Contact Us</h2>
            <p><i className="fas fa-home mr-3"></i>New York, NY 10012, USA</p>
            <p><i className="fas fa-envelope mr-3"></i>ExpenseMate.support@gmail.com</p>
            <p><i className="fas fa-phone mr-3"></i> + 01 234 567 88</p>
            <p><i className="fas fa-print mr-3"></i> + 01 234 567 89</p>
          </div>
          <div style={styles.footerColumn}>
            <h2 style={styles.footerColumnH2}>Subscribe to our Newsletter</h2>
            <div style={styles.newsletterForm}>
              <div style={styles.newsletterInput}>
                <input type="email" placeholder="Enter your email" style={styles.inputField} />
              </div>
                <button type="submit" style={styles.subscribeButton}>Subscribe</button>
            </div>
            </div>
        </section>

        {/* Copyright Section */}
        <div style={styles.footerCopyright}>
        © 2024. Created by Lakkshman 😁.
          {/*<a href="..." style={styles.footerLink}>..</a>*/}
        </div>
      </footer>
    </div>
  );
}

export default Footer;
