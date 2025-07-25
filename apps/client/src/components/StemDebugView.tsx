"use client";

import { useGlobalStore } from "@/store/global";
import { STEMS, getAssignedStem } from "@/constants/stems";
import { cn } from "@/lib/utils";
import { Music, Users, Volume2 } from "lucide-react";
import { motion } from "motion/react";

export function StemDebugView() {
  const connectedClients = useGlobalStore((state) => state.connectedClients);
  const isPlaying = useGlobalStore((state) => state.isPlaying);
  const assignedStems = useGlobalStore((state) => state.assignedStems);
  
  // Get current client ID from WebSocket connection or local storage
  const currentClientId = typeof window !== "undefined" 
    ? localStorage.getItem("clientId") || ""
    : "";
  
  // Find current device index (for fallback)
  const currentDeviceIndex = connectedClients.findIndex(
    (client) => client.clientId === currentClientId
  );
  
  // Get assigned stems from server or use fallback
  const myAssignedStems = assignedStems.length > 0 
    ? assignedStems.map(id => STEMS.find(s => s.id === id)).filter((s): s is typeof STEMS[0] => s !== undefined)
    : (currentDeviceIndex >= 0 ? [getAssignedStem(currentDeviceIndex)] : []);

  return (
    <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Music size={16} />
        <span>Stem Debug View</span>
      </div>

      {/* My Assigned Stems */}
      {myAssignedStems.length > 0 && (
        <div className="bg-neutral-800/50 rounded-md p-3 space-y-2">
          <p className="text-xs text-neutral-400">This Device Playing:</p>
          <div className="space-y-2">
            {myAssignedStems.map((stem) => (
              <div key={stem.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: stem.color }}
                />
                <span className="font-medium">{stem.name}</span>
                {isPlaying && (
                  <motion.div
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <Volume2 size={16} className="text-green-500" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Stems Grid */}
      <div className="space-y-2">
        <p className="text-xs text-neutral-400">All Stems ({STEMS.length}):</p>
        <div className="grid grid-cols-2 gap-2">
          {STEMS.map((stem) => {
            // Find all devices playing this stem
            const devicesPlayingStem = connectedClients.filter(
              (_, index) => getAssignedStem(index).id === stem.id
            );
            const isMyCurrentStem = myAssignedStems.some(s => s.id === stem.id);

            return (
              <div
                key={stem.id}
                className={cn(
                  "bg-neutral-800/30 rounded-md p-2 text-xs space-y-1 border transition-all",
                  isMyCurrentStem
                    ? "border-white/20 bg-neutral-800/50"
                    : "border-neutral-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stem.color }}
                  />
                  <span className={cn(isMyCurrentStem && "font-medium")}>
                    {stem.name}
                  </span>
                </div>
                {devicesPlayingStem.length > 0 && (
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Users size={10} />
                    <span>{devicesPlayingStem.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Assignments */}
      <div className="space-y-2">
        <p className="text-xs text-neutral-400">
          Device Assignments ({connectedClients.length} connected):
        </p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {connectedClients.map((client, index) => {
            const assignedStem = getAssignedStem(index);
            const isCurrentDevice = client.clientId === currentClientId;
            
            return (
              <div
                key={client.clientId}
                className={cn(
                  "flex items-center gap-2 text-xs p-1.5 rounded",
                  isCurrentDevice && "bg-neutral-800/50"
                )}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: assignedStem.color }}
                />
                <span className="text-neutral-400">
                  {isCurrentDevice ? "You" : client.username}:
                </span>
                <span>{assignedStem.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}