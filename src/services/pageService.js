import http from './httpService';
import axios from 'axios';
import { apiUrl } from '../config.json';
import { version } from 'react';

function versionPagesUrl(versionId) {
    return `${apiUrl}/versions/${versionId}/pages`;
}

function groupPagesUrl(groupId) {
    return `${apiUrl}/groups/${groupId}/pages`;
}

function pageUrl(pageId) {
    return `${apiUrl}/pages/${pageId}`;
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

export function saveGroupPage(versionId, groupId, page) {
    console.log("page", page)

    return http.post(groupPagesUrl(groupId), page);
}

export function updatePage(pageId, page) {
    return http.put(`${apiUrl}/pages/${pageId}`, page);
}

export function deletePage(pageId) {
    return http.delete(`${apiUrl}/pages/${pageId}`);
}

export default {
    getVersionPages,
    getGroupPages,
    getPage,
    saveVersionPage,
    saveGroupPage,
    updatePage,
    deletePage
};