import { apiClient } from "@/shared/lib/axios";

export const NotificationService = {
    async getNotifications() {
        const res = await apiClient.get(
            "/notifications"
        );

        console.log("res", res)
        return res;
    },

    async markAsRead(id: number) {
        const res = await apiClient.patch(`/notifications/${id}/read`);
        const data =  res.data;
        console.log("RESULTS: ", data);
        return data;
    }
};  