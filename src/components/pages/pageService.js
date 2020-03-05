import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

function versionPagesUrl(versionId) {
    return `${apiUrl}/versions/${versionId}/pages`;
}

function groupPagesUrl(groupId) {
    return `${apiUrl}/groups/${groupId}/pages`;
}

function pageUrl(pageId) {
    return `${apiUrl}/pages/${pageId}`;
}

function getAllPagesUrl() {
    return `${apiUrl}/pages`;
}
export function getAllPages() {
    return http.get(getAllPagesUrl());
}

export function getVersionPages(versionId) {
    return http.get(versionPagesUrl(versionId));
}

export function getGroupPages(groupId) {
    return http.get(groupPagesUrl(groupId));
}

export function getPage(pageId) {
    return http.get(pageUrl(pageId));
}

export function saveVersionPage(versionId, page) {
    return http.post(versionPagesUrl(versionId), page);
}

export function saveGroupPage(groupId, page) {
    return http.post(groupPagesUrl(groupId), page);
}

export function updatePage(pageId, page) {
    return http.put(`${apiUrl}/pages/${pageId}`, page);
}

export function deletePage(pageId) {
    return http.delete(`${apiUrl}/pages/${pageId}`);
}

export function duplicatePage(pageId) {
    return http.post(`${apiUrl}/duplicatePages/${pageId}`);
}

export default {
    getVersionPages,
    getGroupPages,
    getPage,
    saveVersionPage,
    saveGroupPage,
    updatePage,
    deletePage,
    duplicatePage,
    getAllPages
};