# Stem-Based Audio Distribution Implementation Plan

## Overview

This document outlines the plan to implement stem-based audio distribution in Beatsync, allowing different devices to play different stems (individual instrument/vocal tracks) of the same song. This transforms Beatsync from a synchronized playback system to a distributed multi-track audio system.

## Current State

- **Single Audio File**: Each song is a single mixed audio file played identically on all devices
- **Volume Variation Only**: Devices differ only in volume levels based on spatial positioning
- **Perfect Sync**: All devices play the same content at the same time

## Proposed Functionality

### Core Features

1. **10-Stem Support**: Each song can have up to 8 individual stems (e.g., drums, bass, guitar, vocals, etc.)
2. **Dynamic Distribution**: Stems are distributed evenly across connected devices
3. **Automatic Rebalancing**: When devices join/leave, stems are redistributed
4. **Fallback Mode**: If fewer than 10 devices, some devices play multiple stems

### Distribution Algorithm

```
Number of Devices | Stem Distribution
------------------|------------------
1                 | Device plays all 10 stems (mixed)
2                 | Device 1: stems 1-4, Device 2: stems 5-8
3                 | Device 1: stems 1-3, Device 2: stems 4-6, Device 3: stems 7-8
4                 | Each device plays 2 stems
5-7               | Distribute as evenly as possible
8                 | Each device plays 1 stem
9+                | Multiple devices play the same stem
```

## Implementation Plan

### Phase 1: Data Model Updates

#### 1.1 Update Shared Types

```typescript
// packages/shared/src/types.ts
export const StemSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "drums", "bass", "vocals"
  url: z.string(),
});

export const MultiStemAudioSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  stems: z.array(StemSchema).max(8),
  duration: z.number(), // All stems must be same length
  isMultiStem: z.literal(true),
});

export const AudioSourceSchema = z.union([
  // Existing single-file audio
  z.object({
    url: z.string(),
    isMultiStem: z.literal(false).optional(),
  }),
  // New multi-stem audio
  MultiStemAudioSourceSchema,
]);
```

#### 1.2 Update Message Types

```typescript
// Add stem assignment messages
export const StemAssignmentSchema = z.object({
  type: z.literal("STEM_ASSIGNMENT"),
  clientId: z.string(),
  assignedStems: z.array(z.string()), // stem IDs
});

export const RequestStemReassignmentSchema = z.object({
  type: z.literal("REQUEST_STEM_REASSIGNMENT"),
});
```

### Phase 2: Server Implementation

#### 2.1 Stem Distribution Logic

Create `apps/server/src/services/stemDistributor.ts`:

```typescript
export class StemDistributor {
  distributeStems(stems: string[], clientIds: string[]): Map<string, string[]> {
    // Implementation of distribution algorithm
  }

  redistributeOnClientChange(
    currentAssignments: Map<string, string[]>,
    clientIds: string[],
    totalStems: string[]
  ): Map<string, string[]> {
    // Rebalance stems when clients join/leave
  }
}
```

#### 2.2 Update RoomManager

- Add stem assignment tracking
- Handle stem distribution on client join/leave
- Broadcast stem assignments to all clients
- Ensure all stems are always assigned

### Phase 3: Client Implementation

#### 3.1 Update Audio Store

```typescript
// apps/client/src/stores/useGlobalStore.ts
interface GlobalStore {
  // Existing fields...

  // New stem-related fields
  assignedStems: string[];
  stemBuffers: Map<string, AudioBuffer>;
  stemGainNodes: Map<string, GainNode>;

  // New methods
  loadStems: (stems: Stem[]) => Promise<void>;
  playAssignedStems: (timestamp: number) => void;
  updateStemAssignment: (stemIds: string[]) => void;
}
```

#### 3.2 Audio Loading Strategy

- Load only assigned stems to save bandwidth
- Pre-fetch stems that might be assigned if redistribution occurs
- Cache loaded stems for quick reassignment

#### 3.3 Playback Modifications

- Modify play/pause logic to handle multiple audio sources
- Ensure all assigned stems start/stop synchronously
- Apply individual gain controls per stem

### Phase 4: UI Updates

#### 4.1 Upload Interface

- Support multi-file upload (up to 8 stems)
- Stem naming and ordering interface
- Validation that all stems have equal duration

#### 4.2 Playback Display

- Show which stems are assigned to current device
- Visual indicator of stem distribution across room
- Option to view/request specific stems

#### 4.3 Admin Controls

- Manual stem assignment override
- Mix mode toggle (stems vs. single file)
- Stem mute/solo controls

### Phase 5: Optimization & Edge Cases

#### 5.1 Performance Optimization

- Efficient buffer management for multiple audio streams
- Optimize network usage for stem downloads
- Smart caching strategy

#### 5.2 Edge Case Handling

- Device capability detection (can it handle multiple stems?)
- Fallback for devices that can't play assigned stems
- Handling of incomplete stem sets (< 8 stems)
- Network interruption during stem reassignment

### Phase 6: Testing & Validation

#### 6.1 Test Scenarios

- Single device playing all stems
- Perfect 8-device scenario
- Dynamic joining/leaving during playback
- Network interruption recovery
- Mixed stem/single-file playlists

#### 6.2 Performance Benchmarks

- CPU usage with multiple stems
- Memory consumption
- Network bandwidth requirements
- Synchronization accuracy with multiple streams

## Technical Considerations

### Challenges

1. **Synchronization Complexity**: Ensuring multiple audio streams stay perfectly synced on each device
2. **Network Bandwidth**: Downloading multiple stems increases bandwidth requirements
3. **Device Performance**: Playing multiple stems requires more CPU/memory
4. **Redistribution Timing**: Seamlessly reassigning stems without interrupting playback

### Solutions

1. **Shared Clock**: Use existing NTP synchronization for all stem playback
2. **Progressive Loading**: Load stems based on priority and likelihood of assignment
3. **Device Profiling**: Detect device capabilities and adjust stem count accordingly
4. **Crossfade Redistribution**: Brief crossfade when reassigning stems to avoid gaps

## Migration Strategy

1. **Backward Compatibility**: Support both single-file and multi-stem audio sources
2. **Gradual Rollout**: Enable stem mode per room or per user
3. **Fallback Options**: Always provide mixed version for compatibility

## Future Enhancements

1. **Stem Effects**: Per-stem audio effects (EQ, reverb, etc.)
2. **User Preferences**: Let users choose preferred stems
3. **Stem Recording**: Record individual stem performances
4. **AI Stem Separation**: Auto-generate stems from mixed audio
5. **Stem Marketplace**: Share and download stem packs
6. **Spatial Stem Grouping**: Group related stems based on spatial positioning
   - Devices in proximity play complementary stems (e.g., rhythm section together)
   - Create "instrument zones" where certain areas play specific stem types
   - Dynamic stem assignment based on device clustering in virtual space
   - Combine spatial audio gains with intelligent stem distribution
7. **QR Code Room Sharing**: Generate QR codes for easy room joining
   - Display QR code containing room URL on admin device
   - Quick device onboarding for live performances
   - Support for custom room URLs and deep linking
   - QR code includes room ID and optional stem preferences

## Implementation Timeline

- **Week 1-2**: Data model updates and server distribution logic
- **Week 3-4**: Client multi-stem playback implementation
- **Week 5**: UI updates and upload interface
- **Week 6**: Testing and edge case handling
- **Week 7-8**: Performance optimization and deployment

## Success Metrics

1. **Synchronization Accuracy**: < 10ms drift between stems on same device
2. **Distribution Efficiency**: < 2 seconds to redistribute stems
3. **User Experience**: Seamless playback during redistribution
4. **Performance**: < 20% CPU increase vs. single-file playback
