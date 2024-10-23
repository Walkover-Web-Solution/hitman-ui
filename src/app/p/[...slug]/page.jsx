import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import axios from "axios";
import Providers from "src/app/providers/providers";
import PublicPage from 'src/appPages/publicPage/publicPage';

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getCollectionData({ params, searchParams, customDomain }) {
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
    let response
    try {
        response = await axios.get(`${apiUrl}/get-collection-data${queryParamsString}`);
    }
    catch (error) {
        throw error
    }
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
    let response;
    try {
        response = await axios.get(`${apiUrl}/p/getPublishedDataByPath${queryParamsString}`);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    if (response.status === 200) {
        return response.data
    } else {
        console.error('Data not found');
        throw new Error('Data not found');
    }
}

export default async function Page({ params, searchParams, customDomain }) {
    let data = {}, content = {}
    try {
        data = await fetchPageData({ params, searchParams, customDomain });
    }
    catch (error) {
        data.error = true;
    }
    try {
        content = await getCollectionData({ params, searchParams, customDomain });
    }
    catch (error) {
        content.error = true
    }

    return (
        <>
           <div className="top-container">
                {content?.defaultHeader !== '' && <div className='navbar-public'>
                    <div className='preview-content mx-auto' dangerouslySetInnerHTML={{ __html: content?.defaultHeader ?? '' }} />
                </div>}
                {!data.error ? <div className="main-public-container d-flex max-width-container mx-auto min-h-100vh">
                    <Providers>
                        <PublicEndpoint />
                    </Providers>
                    {(data?.publishedContent?.type == 1 || data?.publishedContent?.type == 3) &&
                        <div className="hm-right-content w-100">
                            <PublicPage collectionData={content} pageContentDataSSR={data?.publishedContent || ''} />
                        </div>}
                </div>
                    :
                    <div className="d-flex h-100vh w-100vw justify-content-center align-items-center w-100">
                        <div>
                            <p>404 | Not Found</p>
                        </div>
                    </div>
                }
                {content?.defaultFooter !== '' && <div className='preview-content mx-auto' dangerouslySetInnerHTML={{ __html: content?.defaultFooter ?? '' }} />}
            </div>
        </>
    );
}