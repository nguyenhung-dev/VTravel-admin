import { BACKEND } from "@/lib/axios";

export async function getCsrfToken() {
  await BACKEND.get("/sanctum/csrf-cookie");

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  const token = getCookie("XSRF-TOKEN");
  return token;
}
