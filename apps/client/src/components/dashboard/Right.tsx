import { cn } from "@/lib/utils";
import { Info, Layers } from "lucide-react";
import { motion } from "motion/react";
import { UserGrid } from "../room/UserGrid";
import { StemDebugView } from "../StemDebugView";
import { StemDebugPanel } from "../StemDebugPanel";
import { useGlobalStore } from "@/store/global";
import { Switch } from "../ui/switch";

interface RightProps {
  className?: string;
}

export const Right = ({ className }: RightProps) => {
  const isStemMode = useGlobalStore((state) => state.isStemMode);
  const toggleStemMode = useGlobalStore((state) => state.toggleStemMode);
  
  return (
    <motion.div
      className={cn(
        "w-full lg:w-80 lg:flex-shrink-0 border-l border-neutral-800/50 bg-neutral-900/50 backdrop-blur-md flex flex-col pb-4 lg:pb-0 text-sm space-y-1 overflow-y-auto pr-2 flex-shrink-0 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      <motion.div className="flex-1">
        <UserGrid />
      </motion.div>

      {/* Stem Mode Toggle - Always visible on mobile */}
      <motion.div className="mx-3 mb-2 bg-neutral-800/30 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary-500" />
            <span>Stem Mode</span>
          </div>
          <Switch
            checked={isStemMode}
            onCheckedChange={toggleStemMode}
          />
        </div>
      </motion.div>

      <motion.div className="mx-3 mb-3">
        <StemDebugView />
      </motion.div>

      {/* Stem Debug Panel - Only show in stem mode */}
      {isStemMode && (
        <motion.div className="mx-3 mb-3">
          <StemDebugPanel />
        </motion.div>
      )}

      <motion.div className="flex flex-col gap-3 px-4 py-3 mt-1 bg-neutral-800/30 rounded-lg mx-3 mb-3 text-neutral-400">
        <div className="flex items-start gap-2">
          <div>
            <h5 className="text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-neutral-300 flex-shrink-0" />
              What is this?
            </h5>
            <p className="text-xs leading-relaxed">
              This grid simulates a spatial audio environment. The headphone
              icon (🎧) is a listening source. The circles represent other
              devices in the room.
            </p>
            <p className="text-xs leading-relaxed mt-3">
              {
                "Drag the headphone icon around and hear how the volume changes on each device. Isn't it cool!"
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
