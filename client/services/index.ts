import axios from "axios";

export const http = axios.create({
  // TODO: dynamicize me
  baseURL: "http://localhost:8080",
});
