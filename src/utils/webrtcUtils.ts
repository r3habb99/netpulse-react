/**
 * WebRTC Utilities for NetPulse
 * Provides peer-to-peer connection capabilities for advanced network testing
 */

export interface PeerConnectionConfig {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
}

/**
 * Create a new RTCPeerConnection with default configuration
 */
export const createPeerConnection = async (config?: PeerConnectionConfig): Promise<RTCPeerConnection> => {
  const defaultConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    iceTransportPolicy: 'all',
    ...config
  };

  try {
    const peerConnection = new RTCPeerConnection(defaultConfig);
    
    // Set up basic event handlers
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    return peerConnection;
  } catch (error) {
    throw new Error(`Failed to create peer connection: ${error}`);
  }
};

/**
 * Set up a data channel for speed testing
 */
export const setupDataChannel = async (
  peerConnection: RTCPeerConnection, 
  channelName: string = 'speedtest'
): Promise<RTCDataChannel> => {
  try {
    const dataChannel = peerConnection.createDataChannel(channelName, {
      ordered: false, // Allow out-of-order delivery for speed
      maxRetransmits: 0 // No retransmissions for speed testing
    });

    return new Promise((resolve, reject) => {
      dataChannel.onopen = () => {
        console.log('Data channel opened:', channelName);
        resolve(dataChannel);
      };

      dataChannel.onerror = (error) => {
        console.error('Data channel error:', error);
        reject(new Error(`Data channel setup failed: ${error}`));
      };

      // Set up the connection
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .catch(reject);
    });
  } catch (error) {
    throw new Error(`Failed to setup data channel: ${error}`);
  }
};

/**
 * Check if WebRTC is supported in the current browser
 */
export const isWebRTCSupported = (): boolean => {
  return !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection);
};

/**
 * Get WebRTC capabilities information
 */
export const getWebRTCCapabilities = (): {
  supported: boolean;
  dataChannels: boolean;
  mediaStreams: boolean;
} => {
  return {
    supported: isWebRTCSupported(),
    dataChannels: !!(window.RTCPeerConnection && RTCPeerConnection.prototype.createDataChannel),
    mediaStreams: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
};
