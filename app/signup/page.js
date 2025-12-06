'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = "http://127.0.0.1:8000";

const buttonStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#28a745',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
};

async function signup(name, email, password, role, secretpass) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, secretpass }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Signup failed");
    }

    return response.json();
}

export default function Page() {   // ⬅️ IMPORTANT: Component name "Page"
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [secretPass, setSecretPass] = useState("");
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (name === "") alert("Fill Name");
        else if (email === "") alert("Fill Email");
        else if (password === "") alert("Fill Password");
        else if (role === 'admin' && secretPass === "") alert("Enter Secret Password");
        else {
            try {
                const result = await signup(name, email, password, role, secretPass);
                setSuccess(`Account created for ${result.email}! Redirecting...`);

                setTimeout(() => {
                    router.push('/login');
                }, 1500);

            } catch (err) {
                setError(err.message);
            }
        }

    };
    const inputStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc'
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f4f4f4'
        }}>
            <div style={{
                padding: '40px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                minWidth: '350px'
            }}>
                <h2>Sign Up</h2>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} suppressHydrationWarning={true}>

                    <input autoComplete="off" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                    <input type="email" placeholder="Email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

                    <input type="password" placeholder="Password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

                    <select value={role} onChange={(e) => setRole(e.target.value)}
                        required style={inputStyle}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    {role === 'admin' &&
                        <input type="text" placeholder="Enter Admin Secret Key" value={secretPass}
                            onChange={(e) => setSecretPass(e.target.value)} required style={inputStyle} />
                    }

                    {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                    {success && <p style={{ color: 'green', margin: 0 }}>{success}</p>}

                    <button type="submit" style={buttonStyle}>Create Account</button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <a href="/login">Sign In</a>
                </p>
            </div>
        </div>
    );
}
