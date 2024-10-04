import axios from 'axios';

const apiUrl = 'http://localhost:2000'; // Replace with your actual API URL

export async function getPublishedContentByIdAndType(id, type) {
  try {
    const response = await axios.get(`${apiUrl}/pages/${id}/getPublishedData?type=${type}`);
    const data = response.data;

    if (type == 4 || type == 5) {
      return data?.publishedContent || '';
    } else {
      return data?.publishedContent?.contents || '';
    }
  } catch (error) {
    console.error('Error fetching published content:', error);
    throw error;
  }
}