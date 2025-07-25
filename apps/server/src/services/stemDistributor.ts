export class StemDistributor {
  private stemIds: string[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  
  /**
   * Distributes stems evenly across connected clients
   * @param clientIds Array of connected client IDs
   * @returns Map of clientId -> assigned stem IDs
   */
  distributeStems(clientIds: string[]): Map<string, string[]> {
    const assignments = new Map<string, string[]>();
    
    if (clientIds.length === 0) {
      return assignments;
    }
    
    if (clientIds.length === 1) {
      // Single device plays all stems
      assignments.set(clientIds[0], [...this.stemIds]);
      return assignments;
    }
    
    // Calculate how many stems per client
    const stemsPerClient = Math.floor(this.stemIds.length / clientIds.length);
    const remainder = this.stemIds.length % clientIds.length;
    
    let stemIndex = 0;
    
    for (let i = 0; i < clientIds.length; i++) {
      const clientId = clientIds[i];
      const clientStems: string[] = [];
      
      // Base number of stems for this client
      let stemCount = stemsPerClient;
      
      // Distribute remainder stems to first clients
      if (i < remainder) {
        stemCount++;
      }
      
      // Assign stems to this client
      for (let j = 0; j < stemCount; j++) {
        if (stemIndex < this.stemIds.length) {
          clientStems.push(this.stemIds[stemIndex]);
          stemIndex++;
        }
      }
      
      assignments.set(clientId, clientStems);
    }
    
    return assignments;
  }
  
  /**
   * Redistributes stems when clients join or leave
   * Tries to minimize changes to existing assignments
   * @param currentAssignments Current stem assignments
   * @param newClientIds Updated list of client IDs
   * @returns New stem assignments
   */
  redistributeOnClientChange(
    currentAssignments: Map<string, string[]>,
    newClientIds: string[]
  ): Map<string, string[]> {
    // For now, just redistribute from scratch
    // In a production system, you might want to minimize changes
    return this.distributeStems(newClientIds);
  }
  
  /**
   * Get the stem assignment for a specific client based on their index
   * This is used as a fallback when server assignments aren't available
   * @param deviceIndex Index of the device in the connected clients list
   * @returns Array of stem IDs assigned to this device
   */
  getClientStemsByIndex(deviceIndex: number, totalDevices: number): string[] {
    if (totalDevices === 0) return [];
    if (totalDevices === 1) return [...this.stemIds];
    
    // Simple round-robin distribution
    const stemIndex = deviceIndex % this.stemIds.length;
    return [this.stemIds[stemIndex]];
  }
}

export const stemDistributor = new StemDistributor();