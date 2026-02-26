import { io, Socket } from 'socket.io-client';

// Tipos para eventos do Socket.io
interface ServerToClientEvents {
  'call:incoming': (data: { roomId: string; callerId: string; callType: 'audio' | 'video' }) => void;
  'call:accepted': (data: { roomId: string }) => void;
  'call:rejected': () => void;
  'call:created': (data: { roomId: string }) => void;
  'call:error': (data: { message: string }) => void;
  'room:joined': (data: { roomId: string }) => void;
  'group:created': (data: { roomId: string }) => void;
  'group:participants': (data: { participants: Array<{ userId: string; socketId: string }> }) => void;
  'peer:joined': (data: { userId: string; socketId: string }) => void;
  'peer:left': (data: { userId: string }) => void;
  'webrtc:offer': (data: { socketId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { socketId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { socketId: string; candidate: RTCIceCandidateInit }) => void;
}

interface ClientToServerEvents {
  authenticate: (userId: string) => void;
  'call:start': (data: { recipientId: string; callType: 'audio' | 'video' }) => void;
  'call:accept': (data: { roomId: string }) => void;
  'call:reject': (data: { roomId: string }) => void;
  'group:create': (data: { hubId: string }) => void;
  'group:join': (data: { roomId: string }) => void;
  'group:leave': (data: { roomId: string }) => void;
  'webrtc:offer': (data: { roomId?: string; targetSocketId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { roomId?: string; targetSocketId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { roomId?: string; targetSocketId: string; candidate: RTCIceCandidateInit }) => void;
}

class WebRTCService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private currentRoomId: string | null = null;
  private selectedAudioDeviceId: string | null = null;

  // Configuração de ICE servers
  private iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // Conectar ao signaling server
  connect(userId: string): void {
    const serverUrl = (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';


    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado ao signaling server');
      this.socket?.emit('authenticate', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado do signaling server');
    });

    this.setupSignalingHandlers();
  }

  // Configurar handlers de signaling
  private setupSignalingHandlers(): void {
    if (!this.socket) return;

    // Chamada recebida
    this.socket.on('call:incoming', ({ roomId, callerId, callType }) => {
      console.log('📞 Chamada recebida de:', callerId);
      this.currentRoomId = roomId;

      // Evento customizado para o componente React
      const event = new CustomEvent('incomingCall', {
        detail: { roomId, callerId, callType }
      });
      window.dispatchEvent(event);
    });

    // Chamada aceita
    this.socket.on('call:accepted', ({ roomId }) => {
      console.log('✅ Chamada aceita');
      this.currentRoomId = roomId;

      const event = new CustomEvent('callAccepted', {
        detail: { roomId }
      });
      window.dispatchEvent(event);
    });

    // Chamada rejeitada
    this.socket.on('call:rejected', () => {
      console.log('❌ Chamada rejeitada');
      const event = new CustomEvent('callRejected');
      window.dispatchEvent(event);
    });

    // Chamada criada
    this.socket.on('call:created', ({ roomId }) => {
      console.log('📞 Chamada criada:', roomId);
      this.currentRoomId = roomId;
    });

    // Erro na chamada
    this.socket.on('call:error', ({ message }) => {
      console.error('❌ Erro na chamada:', message);
      const event = new CustomEvent('callError', {
        detail: { message }
      });
      window.dispatchEvent(event);
    });

    // Sala criada
    this.socket.on('room:joined', ({ roomId }) => {
      console.log('🚪 Entrou na sala:', roomId);
      this.currentRoomId = roomId;
    });

    // Grupo criado
    this.socket.on('group:created', ({ roomId }) => {
      console.log('👥 Grupo criado:', roomId);
      this.currentRoomId = roomId;
    });

    // Novo peer entrou (grupo)
    this.socket.on('peer:joined', async ({ userId, socketId }) => {
      console.log('👤 Novo peer:', userId);
      await this.createPeerConnection(socketId, true);
    });

    // Peer saiu
    this.socket.on('peer:left', ({ userId }) => {
      console.log('👋 Peer saiu:', userId);
      const event = new CustomEvent('peerLeft', {
        detail: { userId }
      });
      window.dispatchEvent(event);
    });

    // Participantes do grupo
    this.socket.on('group:participants', async ({ participants }) => {
      console.log('👥 Participantes do grupo:', participants.length);
      for (const { socketId } of participants) {
        await this.createPeerConnection(socketId, true);
      }
    });

    // WebRTC Signaling
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

  // Criar peer connection
  private async createPeerConnection(socketId: string, isInitiator: boolean): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(socketId, pc);

    // Adicionar tracks locais
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          pc.addTrack(track, this.localStream);
        }
      });
    }

    // Receber tracks remotos
    pc.ontrack = (event) => {
      console.log('🎥 Stream remoto recebido');
      const customEvent = new CustomEvent('remoteStream', {
        detail: { socketId, stream: event.streams[0] }
      });
      window.dispatchEvent(customEvent);
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc:ice-candidate', {
          roomId: this.currentRoomId || undefined,
          targetSocketId: socketId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peerConnections.delete(socketId);
      }
    };

    // Se é o iniciador, criar oferta
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (this.socket && offer) {
          this.socket.emit('webrtc:offer', {
            roomId: this.currentRoomId || undefined,
            targetSocketId: socketId,
            offer: offer
          });
        }
      } catch (error) {
        console.error('Erro ao criar oferta:', error);
      }
    }

    return pc;
  }

  // Handlers WebRTC
  private async handleOffer(socketId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      let pc = this.peerConnections.get(socketId);
      if (!pc) {
        pc = await this.createPeerConnection(socketId, false);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (this.socket && answer) {
        this.socket.emit('webrtc:answer', {
          roomId: this.currentRoomId || undefined,
          targetSocketId: socketId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Erro ao processar oferta:', error);
    }
  }

  private async handleAnswer(socketId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const pc = this.peerConnections.get(socketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  }

  private async handleIceCandidate(socketId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const pc = this.peerConnections.get(socketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Erro ao adicionar ICE candidate:', error);
    }
  }

  // API Pública

  async startCall(recipientId: string, callType: 'audio' | 'video'): Promise<MediaStream> {
    try {
      // Obter mídia local
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: this.selectedAudioDeviceId ? { deviceId: { exact: this.selectedAudioDeviceId } } : true,
        video: callType === 'video'
      });

      // Emitir evento para começar chamada
      if (this.socket) {
        this.socket.emit('call:start', { recipientId, callType });
      }

      return this.localStream;
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      throw error;
    }
  }

  acceptCall(roomId: string): void {
    if (this.socket) {
      this.socket.emit('call:accept', { roomId });
    }
  }

  rejectCall(roomId: string): void {
    if (this.socket) {
      this.socket.emit('call:reject', { roomId });
    }
  }

  async joinGroupCall(hubId: string): Promise<MediaStream> {
    try {
      // Obter mídia local
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: this.selectedAudioDeviceId ? { deviceId: { exact: this.selectedAudioDeviceId } } : true,
        video: true
      });

      // Criar ou juntar sala
      if (this.socket) {
        this.socket.emit('group:create', { hubId });
      }

      return this.localStream;
    } catch (error) {
      console.error('Erro ao entrar em chamada de grupo:', error);
      throw error;
    }
  }

  joinExistingGroup(roomId: string): void {
    if (this.socket) {
      this.socket.emit('group:join', { roomId });
    }
  }

  leaveGroup(roomId: string): void {
    if (this.socket) {
      this.socket.emit('group:leave', { roomId });
    }
  }

  endCall(): void {
    // Parar todos os tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Fechar todas as conexões
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Limpar roomId
    this.currentRoomId = null;
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  disconnect(): void {
    this.endCall();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Audio Device Management
  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      return [];
    }
  }

  async setAudioDevice(deviceId: string): Promise<void> {
    this.selectedAudioDeviceId = deviceId;

    // Se estiver em chamada, trocar o track em tempo real
    if (this.localStream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } }
        });

        const newTrack = newStream.getAudioTracks()[0];
        const oldTrack = this.localStream.getAudioTracks()[0];

        if (oldTrack) {
          this.localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }

        this.localStream.addTrack(newTrack);

        // Atualizar todos os peer connections
        this.peerConnections.forEach(pc => {
          const senders = pc.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(newTrack);
          }
        });

        console.log('🎤 Dispositivo de áudio alterado com sucesso');
      } catch (error) {
        console.error('Erro ao trocar dispositivo de áudio em tempo real:', error);
      }
    }
  }

  // Getters
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }
}

// Exportar instância singleton
export const webrtcService = new WebRTCService();