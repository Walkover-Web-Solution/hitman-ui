import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import Providers from "src/app/providers/providers";
import PublicPage from 'src/appPages/publicPage/publicPage';

async function fetchPageData({ params, searchParams, customDomain }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

    const response = await fetch(apiUrl + `/getPublishedDataByPath${queryParamsString}`);
    if (response.status === 200) {
        return response.json();
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
    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
            {(data?.publishedContent?.type === 1 || data?.publishedContent?.type === 3) && (
                <PublicPage pageContentDataSSR={data?.publishedContent?.publishedPage || ''} />
            )}
        </div>
    );
}