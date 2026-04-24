import { apiClient } from "@/shared/lib/axios";
import { Message } from "../components/chatbotBubble";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { send } from "process";

export const chatbotService = {

    async sendMessage (userMessage: Message) {
    const res = await apiClient.post("/helpdesk/new", userMessage);
    
    // connect WebSocket on first message if not already connected
    console.log("res", res)

    return res;

}, 

async getActiveSessions () {
    const res = await apiClient.get("/helpdesk/sessions/active");
    const data =  res.data;
    console.log("RESULTS: ", data);
    return data;
},

    
}