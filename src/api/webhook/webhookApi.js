import apiRequest from "../main";

export const addWebhook = async (payload) => {
    return await apiRequest.post(`/create-webhook-token`, { payload });
};