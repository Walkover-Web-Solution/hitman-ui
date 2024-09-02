import apiRequest from "../main";

export const like = async (pageId) => {
  await apiRequest.post(`/feedback/positive`, { pageId });
};

export const dislike = async (feedback) => {
  const { pageId, comment, email } = feedback;
  await apiRequest.post(`/feedback/negative`, { pageId, comment, email });
};

export const getFeedbacks = async (collectionId) => {
  const response = await apiRequest.get(`/feedback/${collectionId}`);
  return response.data.feedbacks;
};

export default {
  like,
  dislike,
  getFeedbacks,
};
