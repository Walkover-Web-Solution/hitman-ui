import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import Providers from "src/app/providers/providers";
import PublicPage from 'src/appPages/publicPage/publicPage'

export default async function Page({ params, searchParams, customDomain }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const queryParams = searchParams;
    const slug = params.slug;
    let queryParamApi = {};
    queryParamApi.collectionId = searchParams?.collectionId || '';
    if (slug) {
        queryParamApi.path = slug.join('/');
    }
    else {
        queryParamApi.path = ''
    }
    if (queryParams.version) {
        queryParamApi.versionName = queryParams.version;
    }
    if (customDomain) {
        queryParamApi.custom_domain = customDomain
    }
    let queryParamsString = '?';
    for (let key in queryParamApi) {
        if (queryParamApi.hasOwnProperty(key)) {
            queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi[key])}&`;
        }
    }
    queryParamsString = queryParamsString.slice(0, -1);
    const response = await fetch(apiUrl + `/getPublishedDataByPath${queryParamsString}`);
    let data
    if (response.status === 200) {
        data = await response.json();
    }
    else {
        console.error('Data not found')
    }

    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
            {(data?.publishedContent?.type == 1 || data?.publishedContent?.type == 3) && <PublicPage pageContentDataSSR={data?.publishedContent?.publishedPage || ''} />}
        </div>
    );
}