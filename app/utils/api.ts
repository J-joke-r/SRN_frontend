// utils/api.ts
async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    throw new Error('Backend URL not configured')
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    credentials: 'include',
    mode: 'cors',
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Invalid JSON response' };
  }

  if (!res.ok) {
    const message = data?.error || res.statusText || 'Unknown error';
    throw new Error(`API Error [${res.status}]: ${message}`);
  }

  return data;
}

// Fetch all users (admin only) - call this on demand
export async function fetchUsers(token: string) {
  return apiFetch(`/api/admin/get-users`, token);
}

// Fetch all personal details (admin only) - default on first load
export async function getAllPersonalDetails(token: string, params?: Record<string, string | number | boolean>) {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return apiFetch(`/api/admin/personal-details${queryString}`, token);
}

// Fetch logged-in user's personal details
export async function getMyPersonalDetails(token: string) {
  return apiFetch(`/api/personal-details/me`, token);
}

// Upsert logged-in user's personal details
export async function savePersonalDetails(token: string, details: Record<string, string | number | boolean | null>) {
  return apiFetch(`/api/personal-details`, token, {
    method: 'POST', // backend handles upsert
    body: JSON.stringify(details),
  });
}

// Check the role of the current user
export async function checkRole(token: string) {
  return apiFetch(`/check-role`, token);
}

// Export users to CSV (admin only)
export async function exportUsersCSV(token: string, params?: Record<string, string | number | boolean>) {
  const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/export-users${queryString}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  return response.blob();
}
