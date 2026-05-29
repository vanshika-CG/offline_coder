import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import dbInstance from "../utils/db";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Initial check
    updateQueueCount();

    // Check periodically
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      triggerSync();
    }
  }, [isOnline]);

  const updateQueueCount = async () => {
    try {
      const queue = await dbInstance.getSyncQueue();
      setQueueCount(queue.length);
    } catch (err) {
      console.error("Queue count read error:", err);
    }
  };

  const triggerSync = async () => {
    const queue = await dbInstance.getSyncQueue();
    if (queue.length === 0 || syncing) return;

    console.log(`🔄 Syncing started for ${queue.length} items`);
    setSyncing(true);

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    for (const item of queue) {
      try {
        console.log(`🌐 Synchronizing: ${item.method} ${item.url}`, item.data);
        await axios({
          method: item.method,
          url: `${API_BASE_URL}${item.url}`,
          data: item.data,
          headers
        });
        await dbInstance.removeFromSyncQueue(item.id);
        console.log(`✅ Sync success for ID: ${item.id}`);
      } catch (err) {
        console.error(`❌ Sync failed for ID: ${item.id}`, err.message);
        // Break to avoid clogging if backend is down
        break;
      }
    }

    setSyncing(false);
    updateQueueCount();
  };

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-amber animate-pulse-glow-amber">
        <WifiOff size={14} className="animate-bounce" />
        <span>Offline Mode Active</span>
        {queueCount > 0 && (
          <span className="ml-1 bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
            {queueCount} pending
          </span>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 glow-cyan">
        <RefreshCw size={14} className="animate-spin" />
        <span>Syncing Data...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 glow-green">
      <Wifi size={14} />
      <span>Online & Synced</span>
      {queueCount > 0 && (
        <button
          onClick={triggerSync}
          className="ml-1 text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full hover:bg-emerald-400 transition"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
