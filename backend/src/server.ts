import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { WebRTCSignalingServer } from './controllers/webrtcController';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import startupRoutes from './routes/startup.routes';
import eventRoutes from './routes/event.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import settingsRoutes from './routes/settings.routes';
import conversationRoutes from './routes/conversation.routes';
import hubRoutes from './routes/hub.routes';
import friendshipRoutes from './routes/friendship.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';

// Criar aplicação Express
const app: Application = express();

// Criar servidor HTTP (necessário para Socket.io)
const httpServer = createServer(app);

// Inicializar WebRTC Signaling Server
new WebRTCSignalingServer(httpServer);
console.log('🎥 WebRTC Signaling Server iniciado');

// ====================
// MIDDLEWARE GLOBAL
// ====================

// Segurança
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Aumentado para 1000 requisições por 15 minutos
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Aumentado para 100 tentativas por 15 minutos
  message: 'Muitas tentativas de login/registro, tente novamente mais tarde.',
});

app.use('/api/friendships', friendshipRoutes);

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ====================
// ROTAS
// ====================

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    websocket: 'active'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// ====================
// ERROR HANDLER
// ====================
app.use(errorHandler);

// ====================
// INICIAR SERVIDOR
// ====================
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 DevConnect API está rodando!');
  console.log('=================================');
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log(`🎥 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Encerrando servidor...');
  httpServer.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

export default app;