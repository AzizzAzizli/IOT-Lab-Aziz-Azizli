import API from "./axiosInstance";

export const doRequest = async ({
  method = "GET",
  url,
  data = null,
  params = {},
  headers = {},
}) => {
  try {
    const response = await API({
      method,
      url,
      data,
      params,
      headers: {
        ...headers, 
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
};
