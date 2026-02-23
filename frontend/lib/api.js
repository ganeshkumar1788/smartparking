const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiRequest = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || (data.errors && data.errors[0]?.msg) || "Request failed";
    throw new Error(errorMsg);
  }
  return data;
};
