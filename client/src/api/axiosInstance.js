import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// API.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response) {
//       const { status } = error.response;

//       switch (status) {
//         case 401:
//           console.warn('Oturum vaxtı bitib, yenidən daxil olun.');
//           localStorage.removeItem('token');
//           break;
//         case 403:
//           console.error('Bu əməliyyat üçün icazəniz yoxdur.');
//           break;
//         case 404:
//           console.error('Məlumat tapılmadı.');
//           break;
//         case 500:
//           console.error('Server xətası baş verdi.');
//           break;
//         default:
//           console.error('Gözlənilməz bir xəta oluşdu.');
//       }
//     } else if (error.request) {
//       console.error('Serverlə əlaqə kəsildi. İnternet bağlantınızı yoxlayın.');
//     }

//     return Promise.reject(error);
//   }
// );

export default API;
