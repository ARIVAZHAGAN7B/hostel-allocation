import {
  hostels as mockHostels,
  rooms as mockRooms,
  students as mockStudents,
  complaints as mockComplaints,
  notifications as mockNotifications,
  attendance as mockAttendance,
  payments as mockPayments,
  matches as mockMatches,
  currentStudent as mockCurrentStudent,
  stats as mockStats,
  occupancyByHostel as mockOccupancy,
} from "./mock-data";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bit_auth_token");
  }
  return null;
}

export function setToken(token) {
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("bit_auth_token", token);
    else localStorage.removeItem("bit_auth_token");
  }
}

export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("bit_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // Fallback
      }
    }
  }
  return mockCurrentStudent;
}

export function setCurrentUser(user) {
  if (typeof window !== "undefined") {
    if (user) localStorage.setItem("bit_user", JSON.stringify(user));
    else localStorage.removeItem("bit_user");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.error || `HTTP Error ${res.status}` };
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Network error (${endpoint}): ${err.message}`);
    return {
      error:
        "Cannot connect to backend server. Make sure the Express server is running on port 5000.",
    };
  }
}

// AUTH API
export async function apiLogin(regNo, password, role) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ regNo, password, role }),
  });

  if (result && result.token) {
    setToken(result.token);
    if (result.user) setCurrentUser(result.user);
    return result;
  }

  // Fallback for Warden credentials
  if (role === "warden" || regNo === "warden123" || regNo === "gwarden123") {
    if (regNo === "warden123" && password === "warden") {
      const wardenUser = {
        id: "W001",
        regNo: "warden123",
        name: "Boys Hostel Warden",
        email: "boyswarden@bitsathy.ac.in",
        role: "warden",
        wardenType: "Boys",
        department: "Boys Hostel Administration",
      };
      setToken("mock_warden_token_123");
      setCurrentUser(wardenUser);
      return { token: "mock_warden_token_123", user: wardenUser, role: "warden" };
    } else if (regNo === "gwarden123" && (password === "warden" || password === "gwarden")) {
      const wardenUser = {
        id: "W002",
        regNo: "gwarden123",
        name: "Girls Hostel Warden",
        email: "girlswarden@bitsathy.ac.in",
        role: "warden",
        wardenType: "Girls",
        department: "Girls Hostel Administration",
      };
      setToken("mock_gwarden_token_123");
      setCurrentUser(wardenUser);
      return { token: "mock_gwarden_token_123", user: wardenUser, role: "warden" };
    }
    return { error: "Invalid Warden credentials. Boys Warden: warden123 | Girls Warden: gwarden123" };
  }

  // Fallback for Admin credentials
  if (role === "admin" || regNo === "admin123") {
    if (regNo === "admin123" && password === "admin") {
      const adminUser = {
        id: "A001",
        regNo: "admin123",
        name: "System Administrator",
        email: "admin@bitsathy.ac.in",
        role: "admin",
        department: "IT & Operations",
      };
      setToken("mock_admin_token_123");
      setCurrentUser(adminUser);
      return { token: "mock_admin_token_123", user: adminUser, role: "admin" };
    }
    return { error: "Invalid credentials for Admin. Use ID: admin123 & password: admin" };
  }

  return result;
}

export async function apiRegister(studentData) {
  const result = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(studentData),
  });

  if (result && result.token) {
    setToken(result.token);
    if (result.user) setCurrentUser(result.user);
  }

  return result;
}

export async function apiGetMe() {
  const data = await request("/auth/me");
  if (data && !data.error) return data;
  return getCurrentUser();
}

export async function apiUpdateProfile(payload) {
  const res = await request("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (res && !res.error) {
    setCurrentUser(res);
    return res;
  }
  return res;
}

// HOSTELS API
export async function apiGetHostels(type = "All", search = "") {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (search) params.append("search", search);

  const data = await request(`/hostels?${params.toString()}`);
  if (data && !data.error) return data;

  // Fallback mock filtering
  return mockHostels.filter(
    (h) =>
      (type === "All" || h.type === type) && h.name.toLowerCase().includes(search.toLowerCase()),
  );
}

export async function apiGetHostelById(id) {
  const data = await request(`/hostels/${id}`);
  if (data && !data.error) return data;

  const hostel = mockHostels.find((h) => h.id === id);
  const rooms = mockRooms.filter((r) => r.hostelId === id);
  return { hostel, rooms };
}

export async function apiGetRooms(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/rooms?${query}`);
  if (data && !data.error) return data;
  return [];
}

// APPLICATIONS API
export async function apiSubmitApplication(payload) {
  const res = await request("/applications/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function apiSubmitRoomChange(payload) {
  const res = await request("/applications/room-change", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function apiGetApplications(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/applications?${query}`);
  if (data && !data.error) return data;
  return [];
}

export async function apiGetRoomChangeRequests(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/applications/room-change?${query}`);
  if (data && !data.error) return data;
  return [];
}

export async function apiUpdateApplicationStatus(id, status, allottedRoom) {
  const res = await request(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, allottedRoom }),
  });
  return res;
}

export async function apiUpdateRoomChangeStatus(id, status, allottedRoom) {
  const res = await request(`/applications/room-change/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, allottedRoom }),
  });
  return res;
}

// ROOMMATES API
export async function apiGetRoommateMatches(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/roommates/matches?${query}`);
  if (data && !data.error) return data;
  return mockMatches;
}

export async function apiSendRoommateRequest(payload) {
  const res = await request("/roommates/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res || { success: true };
}

// COMPLAINTS API
export async function apiGetComplaints(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/complaints?${query}`);
  if (data && !data.error) return data;
  return mockComplaints;
}

export async function apiCreateComplaint(payload) {
  const res = await request("/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res || { ...payload, id: `C${Date.now().toString().slice(-3)}`, status: "Pending" };
}

// PAYMENTS API
export async function apiGetPayments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/payments?${query}`);
  if (data && !data.error) return data;
  return mockPayments;
}

// ATTENDANCE API
export async function apiGetAttendance(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/attendance?${query}`);
  if (data && !data.error) return data;
  return mockAttendance;
}

export async function apiMarkAttendance(payload) {
  const res = await request("/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

// NOTIFICATIONS API
export async function apiGetNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await request(`/notifications?${query}`);
  if (data && !data.error) return data;
  return mockNotifications;
}

// DASHBOARD STATS API
export async function apiGetStats() {
  const data = await request("/stats");
  if (data && !data.error) return data;
  return { stats: mockStats, occupancyByHostel: mockOccupancy };
}
