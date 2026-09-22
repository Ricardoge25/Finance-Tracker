import { getToken } from "./auth.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(endpoint, options = {}) {
  // 1. Obtener el token guardado en el navegador
  const token = getToken();

  // 2. Construir las cabeceras por defecto
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // 3. Petición HTTP centralizada hacia Express
  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || "Ocurrió un error en la petición");
    error.status = response.status;
    throw error;
  }

  return response.json();
}