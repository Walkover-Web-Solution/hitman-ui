export async function getParseCurlData(curl) {
    let viaSocketUrl = 'https://flow-api.viasocket.com/utility/parse-curl';
    const response = await fetch(viaSocketUrl, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoia2V5TzJXekJsN1RWIiwib3JnX2lkIjoidktseE9EMWVoWjlTIiwiY29tcGFueV9pZCI6InNiWW5YZkF4VVhQNCIsInZpYXNvY2tldF90b2tlbiI6dHJ1ZSwiaWF0IjoxNzEwMjIyNTU1fQ.UqOQ5bEhoFYylxR9I3N-fRGd5jtzTD0VtIJ7VAxxUS0' // Assuming proxyAuthToken is defined elsewhere
        },
        body: JSON.stringify({ curl }) 
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json(); 
}
