import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

interface Room {
  id: string;
  type: 'direct' | 'group';
  participants: Map<string, string>; // userId -> socketId
  created: Date;
}

export class WebRTCSignalingServer {
  private io: SocketServer;
  private rooms: Map<string, Room> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);

      // Autenticação do usuário
      socket.on('authenticate', (userId: string) => {
        this.userSockets.set(userId, socket.id);
        socket.data.userId = userId;
        console.log(`✅ Usuário autenticado: ${userId}`);
      });

      // ===== CHAMADAS DIRETAS (1-to-1) =====

      // Iniciar chamada
      socket.on('call:start', ({ recipientId, callType }) => {
        const recipientSocketId = this.userSockets.get(recipientId);
        if (recipientSocketId) {
          // Criar sala para a chamada
          const roomId = `direct-${socket.data.userId}-${recipientId}-${Date.now()}`;
          const room: Room = {
            id: roomId,
            type: 'direct',
            participants: new Map([
              [socket.data.userId, socket.id],
              [recipientId, recipientSocketId]
            ]),
            created: new Date()
          };
          this.rooms.set(roomId, room);

          // Notificar destinatário
          this.io.to(recipientSocketId).emit('call:incoming', {
            roomId,
            callerId: socket.data.userId,
            callType
          });

          // Confirmar ao caller
          socket.emit('call:created', { roomId });
        } else {
          socket.emit('call:error', { message: 'Usuário offline' });
        }
      });

      // Aceitar chamada
      socket.on('call:accept', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          // Juntar à sala
          socket.join(roomId);
          
          // Notificar caller que foi aceite
          const [callerId] = Array.from(room.participants.keys()).filter(
            id => id !== socket.data.userId
          );
          const callerSocketId = room.participants.get(callerId);
          if (callerSocketId) {
            this.io.to(callerSocketId).emit('call:accepted', { roomId });
            this.io.to(callerSocketId).emit('room:joined', { roomId });
          }

          socket.emit('room:joined', { roomId });
        }
      });

      // Rejeitar chamada
      socket.on('call:reject', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          // Notificar caller
          room.participants.forEach((socketId, userId) => {
            if (userId !== socket.data.userId) {
              this.io.to(socketId).emit('call:rejected');
            }
          });
          this.rooms.delete(roomId);
        }
      });

      // ===== CHAMADAS EM GRUPO =====

      // Criar sala de grupo
      socket.on('group:create', ({ hubId }) => {
        const roomId = `group-${hubId}-${Date.now()}`;
        const room: Room = {
          id: roomId,
          type: 'group',
          participants: new Map([[socket.data.userId, socket.id]]),
          created: new Date()
        };
        this.rooms.set(roomId, room);
        socket.join(roomId);

        socket.emit('group:created', { roomId });
        console.log(`📹 Sala de grupo criada: ${roomId}`);
      });

      // Juntar sala de grupo
      socket.on('group:join', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          room.participants.set(socket.data.userId, socket.id);
          socket.join(roomId);

          // Notificar outros participantes
          socket.to(roomId).emit('peer:joined', {
            userId: socket.data.userId,
            socketId: socket.id
          });

          // Enviar lista de participantes existentes para o novo
          const existingParticipants = Array.from(room.participants.entries())
            .filter(([userId]) => userId !== socket.data.userId)
            .map(([userId, socketId]) => ({ userId, socketId }));

          socket.emit('group:participants', { participants: existingParticipants });
        }
      });

      // Sair da sala de grupo
      socket.on('group:leave', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          room.participants.delete(socket.data.userId);
          socket.leave(roomId);

          // Notificar outros
          socket.to(roomId).emit('peer:left', { userId: socket.data.userId });

          // Deletar sala se vazia
          if (room.participants.size === 0) {
            this.rooms.delete(roomId);
          }
        }
      });

      // ===== SIGNALING WebRTC =====
// Oferta
socket.on('webrtc:offer', ({ targetSocketId, offer }) => {
  this.io.to(targetSocketId).emit('webrtc:offer', {
    socketId: socket.id,
    offer
  });
});

// Resposta
socket.on('webrtc:answer', ({ targetSocketId, answer }) => {
  this.io.to(targetSocketId).emit('webrtc:answer', {
    socketId: socket.id,
    answer
  });
});

// ICE Candidate
socket.on('webrtc:ice-candidate', ({ targetSocketId, candidate }) => {
  this.io.to(targetSocketId).emit('webrtc:ice-candidate', {
    socketId: socket.id,
    candidate
  });
});


      // ===== DESCONEXÃO =====

      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        
        // Remover de todas as salas
        this.rooms.forEach((room, roomId) => {
          if (room.participants.has(userId)) {
            room.participants.delete(userId);
            
            // Notificar outros
            socket.to(roomId).emit('peer:left', { userId });

            // Deletar sala se vazia
            if (room.participants.size === 0) {
              this.rooms.delete(roomId);
            }
          }
        });

        // Remover do mapa de usuários
        if (userId) {
          this.userSockets.delete(userId);
        }

        console.log(`🔌 Cliente desconectado: ${socket.id}`);
      });
    });
  }

  // Métodos auxiliares

  getRoomInfo(roomId: string) {
    return this.rooms.get(roomId);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getActiveRooms() {
    return Array.from(this.rooms.values());
  }
}