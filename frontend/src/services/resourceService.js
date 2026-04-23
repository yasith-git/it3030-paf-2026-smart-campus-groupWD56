import axios from "axios";

const API_URL = "http://localhost:8080/api/resources";

export const getAllResources = () => {
  return axios.get(API_URL, { withCredentials: true });
};

export const getResourceById = (id) => {
  return axios.get(`${API_URL}/${id}`, { withCredentials: true });
};

export const searchResources = (params) => {
  return axios.get(`${API_URL}/search`, {
    params,
    withCredentials: true
  });
};

export const createResource = (resourceData) => {
  return axios.post(API_URL, resourceData, { withCredentials: true });
};

export const updateResource = (id, resourceData) => {
  return axios.put(`${API_URL}/${id}`, resourceData, { withCredentials: true });
};

export const deleteResource = (id) => {
  return axios.delete(`${API_URL}/${id}`, { withCredentials: true });
};