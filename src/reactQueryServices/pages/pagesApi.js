import { useQuery } from 'react-query';
import { getPageContent } from '../../services/pageServices';

const options = {
    enabled: true,
    staleTime: 60000,
}

export const usePagesQuery = async (key, orgId, pageId) => {
    return useQuery(key, getPageContent(orgId, pageId), options);
};