import { doRequest } from "../api/doRequest";

const IOTservice = {
  async getURL() {
    const url = "/";
    return await doRequest({
      method: "GET",
      url,
    });
  },
};

export default IOTservice;
