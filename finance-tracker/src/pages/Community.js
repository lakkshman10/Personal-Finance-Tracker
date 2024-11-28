import React from "react";

function Community() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.heading}>Welcome to the Community</h1>
        <p style={styles.subheading}>
          Join discussions, share your experiences, and grow your financial
          knowledge.
        </p>
      </header>

      {/* Main Section */}
      <div style={styles.main}>
        {/* Discussion Threads */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>📢 Latest Discussions</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              How to save for retirement effectively?
            </li>
            <li style={styles.listItem}>Best budgeting apps in 2024</li>
            <li style={styles.listItem}>
              Is investing in cryptocurrency worth it?
            </li>
          </ul>
        </section>

        {/* Featured Stories */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>🌟 Featured Stories</h2>
          <div style={styles.grid}>
            <div style={styles.card}>Story 1: Overcoming Debt</div>
            <div style={styles.card}>Story 2: Budgeting for Beginners</div>
            <div style={styles.card}>Story 3: Investment Success</div>
          </div>
        </section>

        {/* Events */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>📅 Upcoming Events</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>Webinar: Smart Investing - Dec 5th</li>
            <li style={styles.listItem}>Workshop: Budget Hacks - Dec 10th</li>
            <li style={styles.listItem}>Panel: Future of FinTech - Dec 15th</li>
          </ul>
        </section>
      </div>

      {/* Call to Action */}
      <footer style={styles.footer}>
        <p>
          Be part of the journey.{" "}
          <a href="/signup" style={styles.link}>
            Join the community today!
          </a>
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Rubik", sans-serif',
    padding: "20px",
    color: "#333",
    backgroundColor: "#f4f4f9", // Light background for the page
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "20px 10px",
    backgroundColor: "#4CAF50", // Green header background
    color: "#fff",
    borderRadius: "10px",
  },
  heading: { 
    fontSize: "3rem", 
    fontWeight: "bold", 
    margin: "10px 0",
  },
  subheading: { 
    fontSize: "1.3rem", 
    color: "#e0ffe0", 
    margin: "5px 0", 
  },
  main: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "30px",
  },
  section: {
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  sectionHeading: { 
    fontSize: "1.8rem", 
    marginBottom: "15px",
    color: "#4CAF50",
    borderBottom: "2px solid #ddd",
    paddingBottom: "5px",
  },
  list: { 
    listStyle: "none", 
    padding: 0,
  },
  listItem: { 
    fontSize: "1rem",
    marginBottom: "10px",
    color: "#555",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    transition: "background-color 0.3s",
  },
  listItemHover: { 
    backgroundColor: "#f0f0f0", 
    color: "#4CAF50",
  },
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
    gap: "20px",
  },
  card: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  cardHover: {
    transform: "scale(1.05)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
  },
  footer: { 
    textAlign: "center", 
    marginTop: "40px", 
    padding: "20px",
    fontSize: "1.1rem",
    backgroundColor: "#4CAF50",
    color: "#fff",
    borderRadius: "10px",
  },
  link: { 
    color: "#fff", 
    textDecoration: "underline", 
    fontWeight: "bold",
  },
};


export default Community;
