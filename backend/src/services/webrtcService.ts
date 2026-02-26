/// <reference lib="dom" />
import { io, Socket } from 'socket.io-client';

class WebRTCService {
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;

  // ICE server configuration
  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  private getServerUrl() {
    const envUrl = (process.env.VITE_API_URL ?? '').replace('/api', '');
    return envUrl || 'http://localhost:3000';
  }

  private dispatchEvent(name: string, detail?: unknown) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  private assertBrowserApi(name: string) {
    if (typeof window === 'undefined') {
      throw new Error(`${name} is not available in a non-browser runtime.`);
    }
  }

  // Connect to signaling server
  connect(userId: string) {
    const serverUrl = this.getServerUrl();

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket?.emit('authenticate', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    this.setupSignalingHandlers();
  }

  // Configure signaling handlers
  private setupSignalingHandlers() {
    if (!this.socket) return;

    // Incoming call
    this.socket.on('call:incoming', ({ roomId, callerId, callType }) => {
      console.log('Incoming call from:', callerId);
      this.dispatchEvent('incomingCall', { roomId, callerId, callType });
    });

    // Call accepted
    this.socket.on('call:accepted', ({ roomId }) => {
      console.log('Call accepted');
      this.dispatchEvent('callAccepted', { roomId });
    });

    // Call rejected
    this.socket.on('call:rejected', () => {
      console.log('Call rejected');
      this.dispatchEvent('callRejected');
    });

    // Room joined
    this.socket.on('room:joined', ({ roomId }) => {
      console.log('Joined room:', roomId);
    });

    // New peer joined (group)
    this.socket.on('peer:joined', async ({ userId, socketId }) => {
      console.log('New peer:', userId);
      await this.createPeerConnection(socketId, true);
    });

    // Peer left
    this.socket.on('peer:left', ({ userId }) => {
      console.log('Peer left:', userId);
      this.dispatchEvent('peerLeft', { userId });
    });

    // Group participants
    this.socket.on('group:participants', async ({ participants }) => {
      for (const { socketId } of participants) {
        await this.createPeerConnection(socketId, true);
      }
    });

    // WebRTC signaling
    this.socket.on('webrtc:offer', async ({ socketId, offer }) => {
      await this.handleOffer(socketId, offer);
    });

    this.socket.on('webrtc:answer', async ({ socketId, answer }) => {
      await this.handleAnswer(socketId, answer);
    });

    this.socket.on('webrtc:ice-candidate', async ({ socketId, candidate }) => {
      await this.handleIceCandidate(socketId, candidate);
    });
  }

  // Create peer connection
  private async createPeerConnection(socketId: string, isInitiator: boolean) {
    this.assertBrowserApi('RTCPeerConnection');
    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(socketId, pc);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Receive remote tracks
    pc.ontrack = (event) => {
      this.dispatchEvent('remoteStream', {
        socketId,
        stream: event.streams[0]
      });
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('webrtc:ice-candidate', {
          targetSocketId: socketId,
          candidate: event.candidate
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed'
      ) {
        this.peerConnections.delete(socketId);
      }
    };

    // If initiator, create offer
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket?.emit('webrtc:offer', {
        targetSocketId: socketId,
        offer
      });
    }

    return pc;
  }

  // WebRTC handlers
  private async handleOffer(
    socketId: string,
    offer: RTCSessionDescriptionInit
  ) {
    let pc = this.peerConnections.get(socketId);
    if (!pc) {
      pc = await this.createPeerConnection(socketId, false);
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.socket?.emit('webrtc:answer', {
      targetSocketId: socketId,
      answer
    });
  }

  private async handleAnswer(
    socketId: string,
    answer: RTCSessionDescriptionInit
  ) {
    const pc = this.peerConnections.get(socketId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(
    socketId: string,
    candidate: RTCIceCandidateInit
  ) {
    const pc = this.peerConnections.get(socketId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Public API

  async startCall(recipientId: string, callType: 'audio' | 'video') {
    this.assertBrowserApi('MediaDevices');
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('mediaDevices.getUserMedia is not available.');
    }

    // Get local media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video'
    });

    // Emit event to start call
    this.socket?.emit('call:start', { recipientId, callType });

    return this.localStream;
  }

  acceptCall(roomId: string) {
    this.socket?.emit('call:accept', { roomId });
  }

  rejectCall(roomId: string) {
    this.socket?.emit('call:reject', { roomId });
  }

  async joinGroupCall(hubId: string) {
    this.assertBrowserApi('MediaDevices');
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('mediaDevices.getUserMedia is not available.');
    }

    // Get local media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    // Create or join room
    this.socket?.emit('group:create', { hubId });

    return this.localStream;
  }

  async joinExistingGroup(roomId: string) {
    this.socket?.emit('group:join', { roomId });
  }

  leaveGroup(roomId: string) {
    this.socket?.emit('group:leave', { roomId });
  }

  endCall() {
    // Stop all tracks
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    // Close all connections
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
  }

  toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  disconnect() {
    this.endCall();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const webrtcService = new WebRTCService();
