import { useStore } from "./stores";

const api = (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  jwt: string | null,
  payload?: any
) =>
  fetch(url, {
    method,
    body: payload ? JSON.stringify(payload) : undefined,
    headers: jwt
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        }
      : {
          "Content-Type": "application/json",
        },
  }).then((response) =>
    response
      .json()
      .then((payload) => (response.ok ? payload : Promise.reject(payload)))
  );

export const useApi = () => {
  const { jwt } = useStore();

  return {
    get: (url: string) => api(url, "GET", jwt),
    post: (url: string, payload: any) => api(url, "POST", jwt, payload),
    put: (url: string, payload: any) => api(url, "PUT", jwt, payload),
    delete: (url: string) => api(url, "DELETE", jwt),
  };
};
