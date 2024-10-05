import PublicEndpoint from "@/components/publicEndpoint/publicEndpoint";
import Providers from "src/app/providers/providers";

export default async function Page({ params, searchParams }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const queryParams = searchParams;
    const slug = params.slug;
    console.log('Query Params:', queryParams);
    console.log('Path:', slug);

    let queryParamApi2 = {};

    queryParamApi2.collectionId = searchParams.collectionId;
    queryParamApi2.path = slug.join('/'); // Exclude the first element

    if (queryParams.version) {
        queryParamApi2.versionName = queryParams.version;
    }

    let queryParamsString = '?';
    for (let key in queryParamApi2) {
        if (queryParamApi2.hasOwnProperty(key)) {
            queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi2[key])}&`;
        }
    }
    queryParamsString = queryParamsString.slice(0, -1);
    const response = await fetch(apiUrl + `/getPublishedDataByPath${queryParamsString}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

const data = await response.json(); 
// Now you can use `data` as needed
console.log(data);



    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}