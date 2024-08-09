export const tokenKey = "token";

export const getProxyToken = () => {
    return window.localStorage.getItem(tokenKey) || "";
}
