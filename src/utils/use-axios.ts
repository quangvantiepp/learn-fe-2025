import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.19:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// add interceptor to automatically add the token into headers
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("accessToken"); // or get from context, Redux...
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJmdWxsTmFtZSI6InF1YW5nIHZhbiB0aWVwIiwidXNlck5hbWUiOiJ2YW50aWVwIiwiZXhwIjoxNzQxMDIzNTA5LCJpYXQiOjE3NDEwMTYzMDksImVtYWlsIjpudWxsfQ.3-iymAfQ-GcL4bsOpHsdDr6wE-pOXVdikRnS7f-ZKI-7UuKAkpU9rtb0jWdPiTzra1v9Wr2C-0Km1VK5F4IWbw"
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
