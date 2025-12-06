import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>
        📝 Notes Application
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', maxWidth: '600px' }}>
        Your personal and secure space to manage your thoughts, ideas, and tasks. Supports role-based access control.
      </p>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Link to the Sign-in page */}
        <Link href="/login" passHref legacyBehavior>
          <a style={buttonStyle}>
            Sign In
          </a>
        </Link>

        {/* Link to the Sign-up page */}
        <Link href="/signup" passHref legacyBehavior>
          <a style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
            Sign Up
          </a>
        </Link>
      </div>

      <p style={{ marginTop: '50px', color: '#666' }}>
        Note: You must be signed in to access the Dashboard.
      </p>
    </div>
  );
}

// Simple inline styles for demonstration
const buttonStyle = {
  padding: '12px 25px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease',
};