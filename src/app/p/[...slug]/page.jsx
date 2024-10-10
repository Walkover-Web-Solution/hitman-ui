import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import axios from "axios";
import Providers from "src/app/providers/providers";
import PublicPage from 'src/appPages/publicPage/publicPage';

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function headerFooter({ params, searchParams, customDomain }) {
    const slug = params.slug;
    let queryParamApi = {
        collectionId: searchParams?.collectionId || '',
    };

    if (slug) {
        queryParamApi.path = slug.join('/');
    } else {
        queryParamApi.path = '';
    }

    if (searchParams.version) {
        queryParamApi.versionName = searchParams.version;
    }

    if (customDomain) {
        queryParamApi.custom_domain = customDomain;
    }

    let queryParamsString = '?';
    for (let key in queryParamApi) {
        if (queryParamApi.hasOwnProperty(key)) {
            queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi[key])}&`;
        }
    }
    queryParamsString = queryParamsString.slice(0, -1);
    const response = await axios.get(`${apiUrl}/get-collection-data${queryParamsString}`);
    return response?.data?.collection; 
};

async function fetchPageData({ params, searchParams, customDomain }) {
    const slug = params.slug;
    let queryParamApi = {
        collectionId: searchParams?.collectionId || '',
    };

    if (slug) {
        queryParamApi.path = slug.join('/');
    } else {
        queryParamApi.path = '';
    }

    if (searchParams.version) {
        queryParamApi.versionName = searchParams.version;
    }

    if (customDomain) {
        queryParamApi.custom_domain = customDomain;
    }

    let queryParamsString = '?';
    for (let key in queryParamApi) {
        if (queryParamApi.hasOwnProperty(key)) {
            queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi[key])}&`;
        }
    }
    queryParamsString = queryParamsString.slice(0, -1);


    const response = await axios.get(`${apiUrl}/getPublishedDataByPath${queryParamsString}`);

    if (response.status === 200) {
        return response.data
    } else {
        console.error('Data not found');
        return null;
    }
}


export async function generateMetadata({ params, searchParams, customDomain }) {
    const data = await fetchPageData({ params, searchParams, customDomain });
    return {
        title: data?.publishedContent?.name || '',
        description: data?.publishedContent?.description || '',
    };
}

export default async function Page({ params, searchParams, customDomain }) {
    const data = await fetchPageData({ params, searchParams, customDomain });
    const content = await headerFooter({ params, searchParams, customDomain }); 
    return (
        <div>
            <div>
                <div className='navbar-public'>
                    {content.defaultHeader !== '' && <div className='preview-content max-width-container mx-auto' dangerouslySetInnerHTML={{ __html: content?.defaultHeader ?? '' }} />}
                </div>
                <div className="main-public-container d-flex max-width-container">
                    <Providers>
                        <PublicEndpoint />
                    </Providers>
                    <div className="hm-right-content">
                        {(data?.publishedContent?.type == 1 || data?.publishedContent?.type == 3) && <PublicPage pageContentDataSSR={data?.publishedContent || ''} />}
                    </div>
                </div>
                {content.defaultFooter !== '' && <div className='preview-content max-width-container mx-auto' dangerouslySetInnerHTML={{ __html: content?.defaultFooter ?? '' }} />}
            </div>
        </div>
    );
}