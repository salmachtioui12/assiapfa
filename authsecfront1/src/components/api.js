
import axios from "axios";

// Axios sans intercepteurs, utilisé pour rafraîchir le token
const plainAxios = axios.create({
  baseURL: "http://localhost:1217/api/v1",
});

// Axios principal avec intercepteurs
const api = axios.create({
  baseURL: "http://localhost:1217/api/v1",
});

// Intercepteur de requêtes : ajoute le token d'accès à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses : gère le rafraîchissement du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si le token a expiré et qu'on n'a pas déjà essayé de le rafraîchir
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await plainAxios.post(
          "/auth/refresh-token",
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        console.log("REFRESH RESPONSE", response.data);
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;


        // Sauvegarde les nouveaux tokens
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Met à jour l'en-tête et relance la requête échouée
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
