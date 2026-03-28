import API from "../utils/api";

export const fetchProducts = async (page = 1) => {
  const res = await API.get(`/products?page=${page}`);
  return res.data;
};