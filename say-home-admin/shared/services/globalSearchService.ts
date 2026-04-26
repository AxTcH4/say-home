import { apiClient } from "../lib/axios"

export const GlobalSearchService = {
    async globalSearch(keyword: string) {
        const response = apiClient.get(`/search?keyword=${keyword}`);
        return response;
    }

}