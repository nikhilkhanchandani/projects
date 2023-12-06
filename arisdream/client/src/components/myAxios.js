import axios from "axios";

const myAxios = axios.create({
  baseURL: "http://localhost:4000",
});

export default myAxios;
