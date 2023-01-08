import { useStore } from "./stores";

const api = <Result>(
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
      .then((payload) =>
        response.ok ? (payload as Result) : Promise.reject(payload)
      )
  );

export const useApi = () => {
  const { jwt } = useStore();

  return {
    get: <Result>(url: string) => api<Result>(url, "GET", jwt),
    post: <Result>(url: string, payload: any) =>
      api<Result>(url, "POST", jwt, payload),
    put: <Result>(url: string, payload: any) =>
      api<Result>(url, "PUT", jwt, payload),
    delete: <Result>(url: string) => api<Result>(url, "DELETE", jwt),
  };
};
