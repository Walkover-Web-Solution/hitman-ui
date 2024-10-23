import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import axios from "axios";
import Providers from "src/app/providers/providers";
import PublicPage from 'src/appPages/publicPage/publicPage';
import PublicSidebar from "../../../components/publicSidebar/publicSidebar";
import HoverBox from "@/components/pages/hoverBox/hoverBox";

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

function getQueryParamsString({ params, searchParams, customDomain }) {
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
    return queryParamsString;
}

async function fetchPageData({ params, searchParams, customDomain }) {
    let response, queryParamsString = getQueryParamsString({ params, searchParams, customDomain });
    try {
        response = await axios.get(`${apiUrl}/getPublishedDataByPath${queryParamsString}`);
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

export async function generateMetadata({ params, searchParams, customDomain }) {
    let data = {}
    try {
        data = await fetchPageData({ params, searchParams, customDomain });
    }
    catch {
        data.error = true
    }
    if (data.error) return null;
    return {
        title: data?.publishedContent?.name || '',
        description: data?.publishedContent?.description || '',
        tags: data?.publishedContent?.meta?.tags || ''
    };
}

const getSidebarData = async ({ searchParams, customDomain }) => {
    let queryString = '';
    if (customDomain) {
        queryString = `?customDomain=${customDomain}`
    }
    else {
        queryString = `?collectionId=${searchParams.collectionId}`
    }
    queryString += '&public=true'
    try {
        const sidebarData = await axios.get(apiUrl + `/getSideBarData${queryString}`)
        const webToken = Object.entries(sidebarData.data.collections)[0][1]?.docProperties?.chatbotObject;
        const headerData = Object.entries(sidebarData.data.collections)[0][1]?.docProperties?.defaultHeader;
        const footerData = Object.entries(sidebarData.data.collections)[0][1]?.docProperties?.defaultFooter;
        return { sidebarData, webToken ,headerData ,footerData};
    }
    catch (error) {
        throw error
    }
}

export default async function Page({ params, searchParams, customDomain }) {
    let data = {}, content = {}, sidebarData = {}, webToken = {},headerData = {},footerData = {};
    try {
        data = await fetchPageData({ params, searchParams, customDomain });
    }
    catch (error) {
        data.error = true;
        console.error(error)
    }
    try {
        content = await headerFooter({ params, searchParams, customDomain });
    }
    catch (error) {
        content.error = true
        console.error(error)
    }
    try {
        const values = await getSidebarData({ params, searchParams, customDomain });
        sidebarData = values.sidebarData;
        webToken = values.webToken;
        headerData = values.headerData;
        footerData = values.footerData;
    }
    catch (error) {
        console.error(error);
        sidebarData.error = error;
        return null;
    }

    return (
        <div>
            {headerData !== '' && <div className='navbar-public position-sticky top-0'>
                <div className='preview-content mx-auto' dangerouslySetInnerHTML={{ __html: headerData ?? '' }} />
            </div>}
            <div className="d-flex m-auto main-public-page-container">
                <PublicSidebar sidebarData={sidebarData} />
                <div className="main-public-container d-flex overflow-auto py-5 flex-grow-1">
                    <Providers>
                        <PublicEndpoint webToken={webToken} />
                    </Providers>
                    {(data?.publishedContent?.type == 1 || data?.publishedContent?.type == 3) &&
                        <div className="hm-right-content mx-5">
                            <PublicPage pageContentDataSSR={data?.publishedContent || ''} pages={sidebarData?.data?.pages || {}} webToken={webToken} />
                        </div>
                    }
                </div>
                <HoverBox html={data?.publishedContent?.contents} />
            </div>
            {footerData !== '' && <div className='preview-content mx-auto' dangerouslySetInnerHTML={{ __html: footerData ?? '' }} />}
        </div>
    );
}