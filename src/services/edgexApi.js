import axios from "axios";

const edgexApi = axios.create({
  baseURL: "/", 
  timeout: 10000,
});

edgexApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("edgeXToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Core Metadata ---
export const getAllDevices = () => edgexApi.get("/core-metadata/api/v3/device/all");
export const getAllDeviceProfiles = () => edgexApi.get("/core-metadata/api/v3/deviceprofile/all");
export const getAllDeviceServices = () => edgexApi.get("/core-metadata/api/v3/deviceservice/all");
export const addDevice = (deviceData) => edgexApi.post("/core-metadata/api/v3/device", deviceData);
export const addDeviceProfile = (payload) => edgexApi.post("/core-metadata/api/v3/deviceprofile", payload);
export const updateDeviceProfile = (payload) => edgexApi.put("/core-metadata/api/v3/deviceprofile", payload);

export const deleteDevice = (name) => 
  edgexApi.delete(`/core-metadata/api/v3/device/name/${encodeURIComponent(name)}`);

// --- Core Data ---
export const getAllEvents = () => edgexApi.get("/core-data/api/v3/event/all");
export const getAllReadings = (offset = 0, limit = 10) =>
  edgexApi.get(`/core-data/api/v3/reading/all?offset=${offset}&limit=${limit}`);

// --- Support Notifications ---
export const getAllSchedules = () => edgexApi.get("/support-notifications/api/v3/subscription/all");
export const getScheduleByName = (name) =>
  edgexApi.get(`/support-notifications/api/v3/subscription/name/${encodeURIComponent(name)}`);
export const addSchedule = (payload) => edgexApi.post("/support-notifications/api/v3/subscription", payload);
export const updateSchedule = (payload) => edgexApi.patch("/support-notifications/api/v3/subscription", payload);
export const deleteScheduleByName = (name) =>
  edgexApi.delete(`/support-notifications/api/v3/subscription/name/${encodeURIComponent(name)}`);


export const getAppServices = () => edgexApi.get("/core-keeper/api/v3/registry/all");


export const getServiceHealth = (serviceId) => {

  const v3Services = ["core-data", "core-metadata"];
  

  const path = `/${serviceId}`;
  
 
  const apiVersion = v3Services.includes(serviceId) ? "v3" : "v2";
  
  const url = `${path}/api/${apiVersion}/ping`;
  
 
  console.log(`Pinging service: ${serviceId}, Path: ${url}`);
  return edgexApi.get(url);
};

export const logout = () => localStorage.removeItem("edgeXToken"); 

export default edgexApi;