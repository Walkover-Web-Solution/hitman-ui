import httpService from "../../httpService";

const exportCollectionApi = async (orgId, collectionId, type) => {
    try {
        const response = await httpService.post(
            `${process.env.REACT_APP_API_URL}/orgs/${orgId}/exportCollection`, 
            { collectionId, type }
        );
        return response.data;
    } catch (error) {
        console.error('Error exporting collection:', error);
        throw error;
    }
};

export default exportCollectionApi;
