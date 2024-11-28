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
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: { 
    fontSize: "2.5rem",
    color: "#4CAF50" 
   },
  subheading: { 
    fontSize: "1.2rem", 
    color: "#555" 
   },
  main: { 
    display: "flex",
    flexDirection: "column",
    gap: "30px" 
   },
  section: { 
    padding: "20px", 
    backgroundColor: "#f9f9f9", 
    borderRadius: "8px" 
   },
  sectionHeading: { 
    fontSize: "1.5rem", 
    marginBottom: "10px"
  },
  list: { 
    listStyle: "none", 
    padding: 0 
  },
  listItem: { 
    fontSize: "1rem",
    marginBottom: "5px", 
    cursor: "pointer" 
  },
  grid: { 
    display: "flex", 
    gap: "15px" 
  },
  card: {
    flex: 1,
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  footer: { 
    textAlign: "center", 
    marginTop: "40px", 
    fontSize: "1rem"
  },
  link: { 
    color: "#4CAF50", 
    textDecoration: "none" 
 },
};

export default Community;
