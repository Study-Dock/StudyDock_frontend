import { supabase } from "./supabaseClient";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const parseResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "The request could not be completed.");
  }

  return data;
};

export const publicApiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  return parseResponse(response);
};

export const apiRequest = async (path, options = {}) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.access_token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  return parseResponse(response);
};
