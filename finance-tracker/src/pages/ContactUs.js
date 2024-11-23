import React from 'react';

function ContactUs() {
  return (
    <div style={styles.container}>
      {/* Gradient Background */}
      <div style={styles.background}></div>

      <div style={styles.content}>
        {/* Left Column: Contact Info */}
        <div style={styles.leftColumn}>
          <h2 style={styles.heading}>Contact Us</h2>
          <p style={styles.text}>We’d love to hear from you! Reach out to us anytime.</p>
          <div style={styles.info}>
            <p>📞 Phone: +1 234 567 890</p>
            <p>📧 Email: support@expensemate.com</p>
            <p>📍 Address: 123 Finance Street, New York, NY</p>
          </div>
          <div style={styles.socialIcons}>
            {/* Add social media icons */}
            <i className="fab fa-facebook" style={styles.icon}></i>
            <i className="fab fa-twitter" style={styles.icon}></i>
            <i className="fab fa-linkedin" style={styles.icon}></i>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div style={styles.rightColumn}>
          <form style={styles.form}>
            <input type="text" placeholder="Your Name" style={styles.input} />
            <input type="email" placeholder="Your Email" style={styles.input} />
            <textarea placeholder="Your Message" style={styles.textarea}></textarea>
            <button type="submit" style={styles.button}>Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Rubik", sans-serif',
    color: '#fff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#4CAF50',
    zIndex: -1,
  },
  content: {
    display: 'flex',
    width: '80%',
    gap: '50px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: '30px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  },
  leftColumn: {
    flex: 1,
    minWidth: '300px',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  text: {
    fontSize: '1.2rem',
    marginBottom: '20px',
  },
  info: {
    fontSize: '1rem',
    lineHeight: '2',
    marginBottom: '20px',
  },
  socialIcons: {
    display: 'flex',
    gap: '15px',
  },
  icon: {
    fontSize: '1.8rem',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  rightColumn: {
    flex: 1,
    minWidth: '300px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px 15px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: 'none',
    outline: 'none',
  },
  textarea: {
    padding: '10px 15px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    height: '100px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default ContactUs;

