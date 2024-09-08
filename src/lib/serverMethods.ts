// import Env from "@/config/env";
import { headers } from "next/headers";

const APP_URL = "http://localhost:3000";

export async function fetchPosts() {
  const res = await fetch(`${APP_URL}/api/post`, {
    cache: "no-cache",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Failed to fecth posts");
  }
  const response = await res.json();

  return response!.data;
}

export async function fetchUsers() {
  const res = await fetch(`${APP_URL}/api/user`, {
    headers: headers(),
    next: {
      revalidate: 3600,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fecth posts");
  }
  const response = await res.json();
  return response?.data;
}

// * Fetch user posts
export async function fetchUserPosts() {
  const res = await fetch(`${APP_URL}/api/user/post`, {
    headers: headers(),
    cache: "no-cache",
    next: {
      revalidate: 3600,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fecth posts");
  }
  const response = await res.json();
  return response!.data;
}


// * Fetch user comments
export async function fetchUserComments() {
    const res = await fetch(`${APP_URL}/api/user/comment`, {
      headers: headers(),
      cache: "default",
      next: {
        revalidate: 3600,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fecth posts");
    }
    const response = await res.json();
    return response!.data;
  }