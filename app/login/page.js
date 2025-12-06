'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = "http://127.0.0.1:8000";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError(null);

        // Call the FastAPI /signin endpoint
        // NOTE: We are using URL search parameters here as defined by the FastAPI endpoint
        try {
            const response = await fetch(`${API_BASE_URL}/signin?email=${email}&password=${password}`, {
                method: 'POST',
                // No body/headers needed for this specific FastAPI endpoint signature
            });

            if (response.ok) {
                const data = await response.json();

                // --- THIS IS WHERE THE REQUIRED CODE GOES ---
                // 1. Store the user's role
                localStorage.setItem('userRole', data.role);
                // 2. Store the user's ID
                localStorage.setItem('currentUserId', data.user_id);
                localStorage.setItem("token", data.token);


                // --- END OF REQUIRED CODE ---

                // Success: Redirect to the dashboard
                router.push('/dashboard');

            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Invalid email or password.');
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError('Connection error. Please ensure the FastAPI server is running.');
        }
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '2rem', color: '#0070f3', marginBottom: '25px' }}>Sign In</h1>
            <form onSubmit={handleSignIn} style={formStyle} suppressHydrationWarning={true}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                />
                {error && <p style={errorStyle}>{error}</p>}
                <button type="submit" style={buttonStyle}>
                    Log In
                </button>
                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <a href="/signup">Sign Up</a>
                </p>
            </form>
        </div>
    );
}

// --- Inline Styles ---

const containerStyle = {
    padding: '40px',
    maxWidth: '400px',
    margin: '80px auto',
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    fontFamily: 'sans-serif'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const inputStyle = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '1rem',
};

const buttonStyle = {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
};

const errorStyle = {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    margin: '0',
    fontSize: '0.9rem'
};