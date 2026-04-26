"use client";
import { useState, useRef, useEffect } from "react";
import { useDebounce } from "../hooks/usDebounce";
import { GlobalSearchService } from "../services/globalSearchService";
import { toast } from "sonner";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SockJS from "sockjs-client";
import { NotificationService } from "@/features/notifications/services/notificationService";
import { calculateTimeAgo } from "../lib/utils";

export default function TopBar({ isSearchOpened, setIsSearchOpened }: any) {
  const [isNotificationsOpened, setIsNotificationsOpened] = useState(false);
  const [value, setValue] = useState("");
  const [prospectResults, setprospectResults] = useState<any[]>([]);
  const [propertiesResults, setPropertiesResults] = useState<any[]>([]);
  const [ticketsResults, setTicketsResults] = useState<any[]>([]);
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<"404" | "400" | "500" | null>(null);
  const debouncedValue = useDebounce(value, 300);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isRinging, setIsRinging] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return; 

    const loadNotifications = async () => {
        const response = await NotificationService.getNotifications();
        const mapped = response.data.data.map((notification: any) => ({
            id: notification.id,
            message: notification.message,
            createdAt: notification.createdAt,
            is_read: notification.is_read,
        }));
        setNotifications(mapped);
    };

    loadNotifications();
    connectWebsock();

    return () => {
        stompClient.current?.deactivate();
    };
}, [user]); 

  const connectWebsock = () => {
    if (stompClient.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("WebSocket connected to notifications");
        client.subscribe(`/topic/notifications/${user?.id}`, (message) => {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [
            { id: notification.id, message: notification.message, createdAt: notification.createdAt, is_read: false },
            ...prev,
          ]);
          // ring the bell
          setIsRinging(true);
          toast.success(notification.message, { duration: 3000, position: "bottom-right" });
          setTimeout(() => setIsRinging(false), 1000);
        });
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const handleMarkAsRead = async (id: number) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => NotificationService.markAsRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleSearch = async (value: string) => {
    const result = await GlobalSearchService.globalSearch(value);
    if (result.data.data.prospects) setprospectResults(result.data.data.prospects);
    if (result.data.data.properties) setPropertiesResults(result.data.data.properties);
    if (result.data.data.tickets) setTicketsResults(result.data.data.tickets);
    if (result.status === 404) {
      setItems([]);
      setError("404");
      toast.error("Aucun resultat", { duration: 3000, position: "bottom-right" });
    } else if (!result || result.status === 500) {
      setItems([]);
      setError("500");
      toast.error("Une erreur s'est produite", { duration: 3000, position: "bottom-right" });
    } else {
      setItems(result.data.data);
      setError(null);
    }
  };

  useEffect(() => {
    if (debouncedValue) handleSearch(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className="w-full bg-gray text-black my-[1vh] shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-row justify-between items-center px-8 py-4">
        <div className="w-[10px]"></div>

        {/* Search */}
        <div className="relative w-[35%] h-10 rounded-[2px] bg-[#f5f5f3] px-2 flex flex-row gap-3 items-center px-4 py-2">
          <img src="/search.svg" alt="" />
          <input
            type="search"
            placeholder="Rechercher des prospets, propriétés tickets,..."
            className="bg-transparent w-full outline-none text-sm"
            onChange={(e: any) => {
              e.stopPropagation();
              setIsSearchOpened(true);
              setValue(e.target.value);
            }}
          />

          {isSearchOpened && (
            <div className="absolute top-12 right-0 w-full bg-white shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)] rounded-[2px] z-50">
              {prospectResults && prospectResults.length > 0 && (
                <div className="px-4 py-2">
                  <p className="text-[#2C1A0E] flex items-center gap-2 text-sm font-semibold border-b pb-2">
                    <img src="/prospects.svg" alt="" /> Prospects
                  </p>
                  {prospectResults.map((item: any, i: number) => (
                    <p key={i} className="p-2 text-sm w-full hover:bg-[#f5f5f3]">
                      {item.user?.firstName} {item.user?.lastName}
                    </p>
                  ))}
                </div>
              )}
              {propertiesResults && propertiesResults.length > 0 && (
                <div className="px-4">
                  <p className="text-[#2C1A0E] flex items-center gap-2 text-sm font-semibold border-b pb-2">
                    <img src="/properties.svg" alt="" /> Propriétés
                  </p>
                  {propertiesResults.map((item: any, i: number) => (
                    <p key={i} className="p-2 text-sm w-full hover:bg-[#f5f5f3]">
                      {item.title}
                    </p>
                  ))}
                </div>
              )}
              {ticketsResults && ticketsResults.length > 0 && (
                <div className="px-4 py-2">
                  <p className="text-[#2C1A0E] flex items-center gap-2 text-sm font-semibold border-b pb-2">
                    <img src="/ticket.svg" alt="" /> Tickets
                  </p>
                  {ticketsResults.map((item: any, i: number) => (
                    <p key={i} className="p-2 text-sm w-full hover:bg-[#f5f5f3]">
                      {item.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="relative flex items-center gap-6">

          {/* Bell */}
          <div className="relative cursor-pointer" onClick={() => setIsNotificationsOpened(!isNotificationsOpened)}>
            <img
              src="/bell.svg"
              alt=""
              className={` ${isRinging ? "bell-ring" : "bell-ring-normal"} `}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <button className="w-fit px-6 py-[9px] text-sm bg-[#2C1A0E] text-white hover:scale-105 transition rounded-[1px]">
            &#10010; Add New
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpened && (
            <div className="absolute top-12 right-0 w-[320px] bg-white shadow-lg rounded-[2px] z-50 border border-gray-100">
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#2C1A0E]">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-gray-400 hover:text-[#2C1A0E] transition"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">Vous êtes à jour!</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((item: any, i: number) => (
                    <div
                      key={i}
                      className={`flex flex-row justify-between items-start gap-2 px-4 py-3 border-b border-gray-50 hover:bg-[#f5f5f3] transition ${!item.is_read ? "bg-[#faf8f4]" : ""}`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {!item.is_read && (
                          <div className="w-2 h-2 mt-1 rounded-full bg-[#2C1A0E] shrink-0" />
                        )}
                        <div className={!item.is_read ? "" : "ml-4"}>
                          <p className="text-sm text-gray-700">{item.message}</p>
                          <span className="text-xs text-gray-400">{calculateTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                      {!item.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="text-[10px] text-gray-400 hover:text-[#2C1A0E] shrink-0 mt-1 transition"
                        >
                          Lu
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}