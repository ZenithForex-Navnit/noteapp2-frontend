// NOTE: Replace with your actual FastAPI backend URL
const API_BASE_URL = "http://127.0.0.1:8000"; 

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/signin?email=${email}&password=${password}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  // In a real app, securely store the returned JWT token (e.g., in an HttpOnly cookie)
  return response.json();
}

// Example: Fetch Notes (Requires Auth Token in a real setup)
export async function fetchNotes() {
    // SIMPLIFIED: Assuming the user is authenticated on the backend for this test.
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) {
        throw new Error('Failed to fetch notes');
    }
    return response.json();
}
// NOTE: These functions would ideally be in a separate API service file, 
// but we include them here for context.

// API_BASE_URL is assumed to be "http://127.0.0.1:8000"

export async function createNote(title, description) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // In a real app, you MUST include the Auth Token here
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create note.');
  }
  return response.json();
}

export async function deleteNote(noteId) {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE',
    // In a real app, you MUST include the Auth Token here
  });

  // FastAPI returns 204 No Content for a successful delete, so we check status
  if (response.status !== 204) {
    throw new Error('Failed to delete note.');
  }
  return true;
}