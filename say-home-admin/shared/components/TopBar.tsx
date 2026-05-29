"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { useDebounce } from "../hooks/usDebounce";
import { GlobalSearchService } from "../services/globalSearchService";
import { calculateTimeAgo } from "../lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NotificationService } from "@/features/notifications/services/notificationService";

interface SearchProspect {
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface SearchProperty {
  title?: string;
}

interface SearchTicket {
  title?: string;
}

interface SearchResults {
  prospects?: SearchProspect[];
  properties?: SearchProperty[];
  tickets?: SearchTicket[];
}

interface NotificationItem {
  id: number;
  message: string;
  createdAt: string;
  is_read: boolean;
}

interface NotificationApiItem {
  id: number;
  message: string;
  createdAt: string;
  is_read: boolean;
}

interface TopBarProps {
  isSearchOpened: boolean;
  setIsSearchOpened: (value: boolean) => void;
}

export default function TopBar({
  isSearchOpened,
  setIsSearchOpened,
}: TopBarProps) {
  const [isNotificationsOpened, setIsNotificationsOpened] = useState(false);
  const [value, setValue] = useState("");
  const [prospectResults, setProspectResults] = useState<SearchProspect[]>([]);
  const [propertiesResults, setPropertiesResults] = useState<SearchProperty[]>([]);
  const [ticketsResults, setTicketsResults] = useState<SearchTicket[]>([]);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isRinging, setIsRinging] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const stompClient = useRef<Client | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const connectWebsock = useCallback(() => {
    if (!user?.id || stompClient.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        client.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const notification = JSON.parse(message.body) as NotificationApiItem;
          setNotifications((prev) => [
            {
              id: notification.id,
              message: notification.message,
              createdAt: notification.createdAt,
              is_read: false,
            },
            ...prev,
          ]);
          setIsRinging(true);
          toast.success(notification.message, {
            duration: 3000,
            position: "bottom-right",
          });
          setTimeout(() => setIsRinging(false), 1000);
        });
      },
    });

    client.activate();
    stompClient.current = client;
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadNotifications = async () => {
      const response = await NotificationService.getNotifications();
      const mapped = (response.data.data as NotificationApiItem[]).map(
        (notification) => ({
          id: notification.id,
          message: notification.message,
          createdAt: notification.createdAt,
          is_read: notification.is_read,
        }),
      );
      setNotifications(mapped);
    };

    void loadNotifications();
    connectWebsock();

    return () => {
      stompClient.current?.deactivate();
    };
  }, [user, connectWebsock]);

  const handleMarkAsRead = async (id: number) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((notification) => !notification.is_read);
    await Promise.all(
      unread.map((notification) => NotificationService.markAsRead(notification.id)),
    );
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true })),
    );
  };

  const handleSearch = useCallback(async (keyword: string) => {
    const result = await GlobalSearchService.globalSearch(keyword);
    const data = (result.data.data ?? {}) as SearchResults;

    setProspectResults(data.prospects ?? []);
    setPropertiesResults(data.properties ?? []);
    setTicketsResults(data.tickets ?? []);

    if (result.status === 404) {
      toast.error("Aucun resultat", {
        duration: 3000,
        position: "bottom-right",
      });
    } else if (!result || result.status === 500) {
      toast.error("Une erreur s'est produite", {
        duration: 3000,
        position: "bottom-right",
      });
    }
  }, []);

  const handleSearchChange = (nextValue: string) => {
    setIsSearchOpened(true);
    setValue(nextValue);
    if (!nextValue.trim()) {
      setProspectResults([]);
      setPropertiesResults([]);
      setTicketsResults([]);
    }
  };

  return (
    <div className="my-[1vh] w-full bg-gray text-black shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-row items-center justify-between px-8 py-4">
        <div className="w-[10px]" />

        <div className="relative flex h-10 w-[35%] flex-row items-center gap-3 rounded-[2px] bg-[#f5f5f3] px-4 py-2">
          <Image src="/search.svg" alt="" width={16} height={16} />
          <input
            type="search"
            placeholder="Rechercher des prospects, proprietes, tickets..."
            className="w-full bg-transparent text-sm outline-none"
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          {debouncedValue ? (
            <SearchEffect
              debouncedValue={debouncedValue}
              onSearch={handleSearch}
            />
          ) : null}

          {isSearchOpened && (
            <div className="absolute right-0 top-12 z-50 w-full rounded-[2px] bg-white shadow-[0_5px_2px_-3px_rgba(0,0,0,0.05)]">
              {prospectResults.length > 0 && (
                <div className="px-4 py-2">
                  <p className="flex items-center gap-2 border-b pb-2 text-sm font-semibold text-[#2C1A0E]">
                    <Image src="/prospects.svg" alt="" width={16} height={16} /> Prospects
                  </p>
                  {prospectResults.map((item, index) => (
                    <p key={index} className="w-full p-2 text-sm hover:bg-[#f5f5f3]">
                      {item.user?.firstName} {item.user?.lastName}
                    </p>
                  ))}
                </div>
              )}
              {propertiesResults.length > 0 && (
                <div className="px-4">
                  <p className="flex items-center gap-2 border-b pb-2 text-sm font-semibold text-[#2C1A0E]">
                    <Image src="/properties.svg" alt="" width={16} height={16} /> Proprietes
                  </p>
                  {propertiesResults.map((item, index) => (
                    <p key={index} className="w-full p-2 text-sm hover:bg-[#f5f5f3]">
                      {item.title}
                    </p>
                  ))}
                </div>
              )}
              {ticketsResults.length > 0 && (
                <div className="px-4 py-2">
                  <p className="flex items-center gap-2 border-b pb-2 text-sm font-semibold text-[#2C1A0E]">
                    <Image src="/ticket.svg" alt="" width={16} height={16} /> Tickets
                  </p>
                  {ticketsResults.map((item, index) => (
                    <p key={index} className="w-full p-2 text-sm hover:bg-[#f5f5f3]">
                      {item.title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-6">
          <div
            className="relative cursor-pointer"
            onClick={() => setIsNotificationsOpened(!isNotificationsOpened)}
          >
            <Image
              src="/bell.svg"
              alt=""
              width={20}
              height={20}
              className={isRinging ? "bell-ring" : "bell-ring-normal"}
            />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {isNotificationsOpened && (
            <div className="absolute right-0 top-12 z-50 w-[320px] rounded-[2px] border border-gray-100 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-[#2C1A0E]">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => void handleMarkAllAsRead()}
                    className="text-xs text-gray-400 transition hover:text-[#2C1A0E]"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">Vous etes a jour!</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-row items-start justify-between gap-2 border-b border-gray-50 px-4 py-3 transition hover:bg-[#f5f5f3] ${
                        !item.is_read ? "bg-[#faf8f4]" : ""
                      }`}
                    >
                      <div className="flex flex-1 items-start gap-2">
                        {!item.is_read && (
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2C1A0E]" />
                        )}
                        <div className={!item.is_read ? "" : "ml-4"}>
                          <p className="text-sm text-gray-700">{item.message}</p>
                          <span className="text-xs text-gray-400">
                            {calculateTimeAgo(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!item.is_read && (
                        <button
                          onClick={() => void handleMarkAsRead(item.id)}
                          className="mt-1 shrink-0 text-[10px] text-gray-400 transition hover:text-[#2C1A0E]"
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

function SearchEffect({
  debouncedValue,
  onSearch,
}: {
  debouncedValue: string;
  onSearch: (keyword: string) => Promise<void>;
}) {
  useEffect(() => {
    void onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return null;
}
