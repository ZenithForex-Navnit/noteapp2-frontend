'use client';

import { useState, useEffect } from 'react';

// --- Configuration and API Helpers (Local Definitions) ---
const API_BASE_URL = "http://127.0.0.1:8000";
// MOCK_CURRENT_USER_ID is used for frontend logic (e.g., hiding the Delete button 
// if the user is not the owner). Must align with the mock ID in the FastAPI backend (main.py).
// NOTE: In a real app, this should also be loaded from stored session data, not hardcoded.
const MOCK_CURRENT_USER_ID = 1;

// API call to fetch all notes (or just the user's notes, depending on the backend logic)
async function fetchNotes() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch notes. Token missing/invalid.');
    }

    return response.json();
}

// API call to create a new note
async function createNote(title, description) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description }),
    });
    if (!response.ok) {
        throw new Error('Failed to create note.');
    }
    return response.json();
}

// API call to delete a note by ID
async function deleteNote(noteId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        method: 'DELETE',
    });
    // Check for successful deletion (204 No Content)
    if (response.status !== 204) {
        throw new Error('Failed to delete note. Check permissions or if the note exists.');
    }
    return true;
}
// --- End API Helpers ---


export default function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the logged-in user's role, loaded from storage on mount
    const [currentUserRole, setCurrentUserRole] = useState('user');

    // State for the new note form
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showEditButton, setShowEditButton] = useState(false);
    const [newId, setNewId] = useState("0");

    // Function to load notes and refresh the list
    const loadNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotes();
            setNotes(data);
        } catch (err) {
            console.error("Error loading notes:", err);
            setError("Failed to load notes. Please ensure the backend is running and you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Load Role from Storage on Mount ---
    useEffect(() => {
        // 1. Load the stored role (e.g., from localStorage)
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
            setCurrentUserRole(storedRole);
        } else {
            // Handle case where role isn't found (e.g., user navigated directly)
            setError("User role not found. Please log in.");
        }

        // 2. Load the notes
        loadNotes();
    }, []);
    // --- END NEW ---

    // Handler for creating a new note
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle || !newDescription) {
            setError("Title and Description cannot be empty.");
            return;
        }

        try {
            await createNote(newTitle, newDescription);
            setNewTitle('');
            setNewDescription('');
            setError(null);
            loadNotes(); // Refresh the list

        } catch (err) {
            console.error("Creation failed:", err);
            setError("Note creation failed. Check permissions or backend connection.");
        }
    };

    // Handler for deleting an existing note
    const handleDelete = async (noteId) => {
        // Custom check instead of standard alert()
        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            await deleteNote(noteId);
            setError(null);
            loadNotes(); // Refresh the list
        } catch (err) {
            console.error("Deletion failed:", err);
            setError("Deletion failed. Admins can delete any note, Users can only delete their own. Check backend console for error details.");
        }
    };

    // --- Conditional Logic for Delete Button Visibility ---
    const canDelete = (noteOwnerId) => {
        // 1. Admin can delete ANY note
        if (currentUserRole === 'admin') {
            return true;
        }
        // 2. Regular user can only delete their OWN notes
        if (currentUserRole === 'user' && noteOwnerId === MOCK_CURRENT_USER_ID) {
            return true;
        }
        // Otherwise, deletion is not allowed
        return false;
    };

    if (loading) {
        return (<div style={containerStyle}><h1 style={{ color: '#0070f3' }}>Notes Dashboard</h1><p>Loading notes...</p></div>);
    }
    function handleEditClick(note) {
        setNewId(note.id);
        setNewTitle(note.title);
        setNewDescription(note.description);
        setShowEditButton(true);  // Open modal
    }

    async function updateNote(noteId, title, description) {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title, description }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Update failed:", err);
            throw new Error("Failed to update note");
        }

        return response.json();
    }
    async function handleEdit() {
        try {
            await updateNote(newId, newTitle, newDescription);

            alert("Note updated successfully!");
            setNewId("0");
            setNewDescription("");
            setNewTitle("");
            setShowEditButton(false);
            const data = await fetchNotes();
            setNotes(data);
        } catch (err) {
            console.error(err);
            alert("Error updating note");
        }
    }
    const buttonStyle = {
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
    };

    // Alag color dena ho to spread operator use kar sakte ho
    const addButtonStyle = { ...buttonStyle, backgroundColor: "#28a745", color: "white" }; // Green
    const editButtonStyle = { ...buttonStyle, backgroundColor: "#ffc107", color: "black" }; // Yellow




    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#0070f3' }}>
                📝 Notes Dashboard
            </h1>

            {/* Displaying the ACTUAL logged-in role (loaded from storage) */}
            <div style={roleDisplayContainerStyle}>
                <span>Logged-in Role: </span>
                <span style={{ color: currentUserRole === 'admin' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                    {currentUserRole.toUpperCase()} (ID: {MOCK_CURRENT_USER_ID})
                </span>
            </div>

            {/* New Note Creation Form */}
            <div style={formContainerStyle}>
                <h3>Create New Note (Owned by User ID {MOCK_CURRENT_USER_ID})</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Note Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <textarea
                        placeholder="Note Description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        required
                        rows="3"
                        style={inputStyle}
                    />
                    {showEditButton ? (
                        <button type="button" onClick={handleEdit} style={editButtonStyle}>
                            Edit
                        </button>
                    ) : (
                        <button type="button" onClick={handleCreate} style={addButtonStyle}>
                            Add Note
                        </button>
                    )}
                </form>
            </div>


            {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Existing Notes ({notes.length})</h3>

            {/* List/Table of Notes */}
            <table style={tableStyle}>
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Owner Name</th>
                        <th style={thStyle}>Owner mail</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notes.map((note) => (
                        <tr key={note.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={tdStyle}>{note.title}</td>
                            <td style={tdStyle}>{note.description}</td>
                            <td style={{ ...tdStyle, color: '#6c757d', fontSize: '0.8rem' }}>{note.owner.name}</td>
                            <td style={{ ...tdStyle, color: '#6c757d', fontSize: '0.8rem' }}>{note.owner.email}</td>
                            <td style={tdStyle}>
                                <button
                                    style={{ ...actionButtonStyle, backgroundColor: '#ffc107', marginRight: '8px' }}
                                    onClick={() => handleEditClick(note)}
                                >
                                    Edit
                                </button>

                                {/* CONDITIONAL DELETE BUTTON */}
                                {/* {canDelete(note.owner_id) ? ( */}
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    style={{ ...actionButtonStyle, backgroundColor: '#dc3545' }}
                                >
                                    Delete
                                </button>
                                {/* ) : ( */}
                                {/* <span style={{ color: '#6c757d', fontSize: '0.8rem', paddingLeft: '8px' }}> */}
                                {/* (No Perms) */}
                                {/* </span> */}
                                {/* )} */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {notes.length === 0 && <p style={{ marginTop: '20px' }}>No notes found.</p>}
        </div>
    );
}

// --- Inline Styles ---

const containerStyle = {
    padding: '40px',
    maxWidth: '900px',
    margin: 'auto',
    fontFamily: 'sans-serif'
};

const formContainerStyle = {
    padding: '20px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    marginBottom: '30px',
    backgroundColor: '#f8f9fa'
};

const roleDisplayContainerStyle = {
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
};

const createButtonStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    borderRadius: '8px',
    overflow: 'hidden'
};

const thStyle = {
    border: 'none',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#495057'
};

const tdStyle = {
    border: 'none',
    padding: '12px 15px',
};

const actionButtonStyle = {
    padding: '6px 10px',
    borderRadius: '4px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'normal',
    fontSize: '0.8rem',
};