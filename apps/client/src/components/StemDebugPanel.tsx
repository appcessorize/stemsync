"use client";

import { useGlobalStore } from "@/store/global";
import { STEMS } from "@/constants/stems";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, XCircle, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StemDebugPanel() {
  const audioCache = useGlobalStore((state) => state.audioCache);
  const audioSources = useGlobalStore((state) => state.audioSources);
  const selectedAudioUrl = useGlobalStore((state) => state.selectedAudioUrl);
  const isStemMode = useGlobalStore((state) => state.isStemMode);
  const assignedStems = useGlobalStore((state) => state.assignedStems);
  const isInitingSystem = useGlobalStore((state) => state.isInitingSystem);
  const audioPlayer = useGlobalStore((state) => state.audioPlayer);
  
  const [loadingStems, setLoadingStems] = useState<Set<string>>(new Set());
  const [loadErrors, setLoadErrors] = useState<Map<string, string>>(new Map());

  const loadSingleStem = async (stem: typeof STEMS[0]) => {
    setLoadingStems(prev => new Set(prev).add(stem.id));
    setLoadErrors(prev => {
      const next = new Map(prev);
      next.delete(stem.id);
      return next;
    });

    try {
      const state = useGlobalStore.getState();
      
      // Check if audio system is initialized
      if (!state.audioPlayer) {
        throw new Error("Audio system not initialized. Click 'Start System' first.");
      }
      
      // Load the stem
      await state.handleSetAudioSources({ sources: [{ url: stem.url }] });
      
      console.log(`Successfully loaded stem: ${stem.name}`);
    } catch (error) {
      console.error(`Failed to load stem ${stem.name}:`, error);
      setLoadErrors(prev => new Map(prev).set(stem.id, error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoadingStems(prev => {
        const next = new Set(prev);
        next.delete(stem.id);
        return next;
      });
    }
  };

  const loadAllStems = async () => {
    const state = useGlobalStore.getState();
    
    if (!state.audioPlayer) {
      alert("Audio system not initialized. Click 'Start System' first.");
      return;
    }
    
    for (const stem of STEMS) {
      if (!audioCache.has(stem.url)) {
        await loadSingleStem(stem);
      }
    }
  };

  return (
    <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Stem Debug Panel</h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Audio System: {audioPlayer ? "✅ Ready" : "❌ Not initialized"}</div>
          <div>Loading: {isInitingSystem ? "⏳ Yes" : "No"}</div>
          <div>Stem Mode: {isStemMode ? "✅ Enabled" : "❌ Disabled"}</div>
          <div>Audio Sources: {audioSources.length}</div>
          <div>Cache Size: {audioCache.size}</div>
          <div>Selected: {selectedAudioUrl ? "Yes" : "None"}</div>
          <div className="col-span-2">
            Assigned Stems: {assignedStems.length > 0 ? assignedStems.join(", ") : "None"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-medium">Stem Loading Status</h4>
          <Button
            size="sm"
            variant="outline"
            onClick={loadAllStems}
            className="h-6 text-xs"
          >
            Load All Stems
          </Button>
        </div>
        
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {STEMS.map((stem) => {
            const isLoaded = audioCache.has(stem.url);
            const isLoading = loadingStems.has(stem.id);
            const error = loadErrors.get(stem.id);
            const isAssigned = assignedStems.includes(stem.id);
            const isInSources = audioSources.some(s => s.url === stem.url);
            
            return (
              <div
                key={stem.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded text-xs",
                  "bg-neutral-800/30 hover:bg-neutral-800/50",
                  isAssigned && "ring-1 ring-primary/50"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stem.color }}
                />
                
                <span className="flex-1 truncate">
                  {stem.id}: {stem.name}
                  {isAssigned && " (assigned)"}
                  {isInSources && " [src]"}
                </span>
                
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isLoaded ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : error ? (
                  <XCircle className="w-3 h-3 text-red-500" title={error} />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadSingleStem(stem)}
                    className="h-5 w-5 p-0"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-medium">Debug Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const state = useGlobalStore.getState();
              console.log("Audio Cache:", Array.from(state.audioCache.keys()));
              console.log("Audio Sources:", state.audioSources);
              console.log("Assigned Stems:", state.assignedStems);
              console.log("Selected URL:", state.selectedAudioUrl);
              console.log("Is Playing:", state.isPlaying);
              console.log("Audio Player:", state.audioPlayer);
            }}
            className="h-7 text-xs"
          >
            Log State
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const state = useGlobalStore.getState();
              state.setSelectedAudioUrl(audioSources[0]?.url || "");
            }}
            disabled={audioSources.length === 0}
            className="h-7 text-xs"
          >
            Set First as Selected
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const state = useGlobalStore.getState();
              if (state.assignedStems.length > 0) {
                const stemSources = state.assignedStems.map(id => {
                  const stem = STEMS.find(s => s.id === id);
                  return stem ? { url: stem.url } : null;
                }).filter(Boolean) as { url: string }[];
                
                state.handleSetAudioSources({ sources: stemSources });
              }
            }}
            disabled={assignedStems.length === 0}
            className="h-7 text-xs"
          >
            Load Assigned Stems
          </Button>
        </div>
      </div>

      {loadErrors.size > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-red-400">Errors:</h4>
          {Array.from(loadErrors.entries()).map(([id, error]) => (
            <div key={id} className="text-xs text-red-300">
              {id}: {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}