import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings } from 'lucide-react';
import { webrtcService } from '../services/webrtcService';

interface VideoCallModalProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  callType: 'audio' | 'video';
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  callType,
  onClose
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadDevices();
    startCall();
    return () => {
      endCall();
    };
  }, []);

  const loadDevices = async () => {
    const devices = await webrtcService.getAudioDevices();
    setAudioDevices(devices);
    if (devices.length > 0) {
      setSelectedAudioDevice(devices[0].deviceId);
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    await webrtcService.setAudioDevice(deviceId);

    // Se já tivermos um stream, precisamos atualizar o track de áudio local
    if (localStreamRef.current) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } }
        });
        const newTrack = newStream.getAudioTracks()[0];
        const oldTrack = localStreamRef.current.getAudioTracks()[0];

        if (oldTrack) {
          localStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        }

        localStreamRef.current.addTrack(newTrack);

        // Atualizar no PeerConnection
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const audioSender = senders.find(s => s.track?.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(newTrack);
          }
        }
      } catch (error) {
        console.error('Erro ao trocar dispositivo:', error);
      }
    }
  };

  const startCall = async () => {
    try {
      // Obter mídia local
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        video: callType === 'video'
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Configurar WebRTC
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Adicionar tracks locais
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Receber tracks remotos
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Simular conexão após 2 segundos (substituindo o antigo TODO de sinalização por agora)
      setTimeout(() => setCallState('connected'), 2000);

    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      alert('Erro ao acessar câmera/microfone');
      onClose();
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setCallState('ended');
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-2 pr-6 rounded-full border border-white/5 shadow-2xl">
          <img
            src={recipientAvatar || `https://avatar.vercel.sh/${recipientId}`}
            alt={recipientName}
            className="w-12 h-12 rounded-full border-2 border-indigo-500/20"
          />
          <div>
            <h3 className="font-bold text-white text-lg">{recipientName}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {callState === 'connecting' && 'Iniciando chamada...'}
                {callState === 'connected' && 'Em chamada'}
                {callState === 'ended' && 'Finalizada'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3.5 bg-slate-900/40 backdrop-blur-xl hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5 active:scale-95"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="p-3.5 bg-slate-900/40 backdrop-blur-xl hover:bg-red-500/20 text-white rounded-2xl transition-all border border-white/5 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Settings Popover */}
      {showSettings && (
        <div className="absolute top-24 right-6 w-72 bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 z-30 shadow-2xl">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" /> Entrada de Áudio
          </h4>
          <div className="space-y-2">
            {audioDevices.map(device => (
              <button
                key={device.deviceId}
                onClick={() => handleDeviceChange(device.deviceId)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${selectedAudioDevice === device.deviceId
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
              >
                <span className="truncate flex-1 pr-2">{device.label || `Microfone ${device.deviceId.slice(0, 5)}`}</span>
                {selectedAudioDevice === device.deviceId && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Remote Video */}
        <div className="w-full h-full relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Overlay if connecting */}
          {callState !== 'connected' && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                <img
                  src={recipientAvatar || `https://avatar.vercel.sh/${recipientId}`}
                  alt={recipientName}
                  className="w-40 h-40 rounded-full border-4 border-white/5 relative z-10"
                />
              </div>
              <h2 className="text-2xl font-black text-white mt-8 mb-2">Chamando {recipientName}...</h2>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Video - Picture in Picture */}
        {callType === 'video' && (
          <div className="absolute bottom-32 right-8 w-64 h-48 bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group transition-all hover:scale-105 z-20">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <VideoOff className="w-12 h-12 text-slate-600" />
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
            )}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Você
            </div>
          </div>
        )}
      </div>

      {/* Main Controls Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-slate-900/40 backdrop-blur-2xl px-8 py-5 rounded-[40px] border border-white/5 shadow-2xl flex items-center gap-6">
          <button
            onClick={toggleMute}
            className={`p-5 rounded-3xl transition-all active:scale-90 ${isMuted
                ? 'bg-red-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
          >
            {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-5 rounded-3xl transition-all active:scale-90 ${isVideoOff
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
            >
              {isVideoOff ? <VideoOff className="w-8 h-8" /> : <VideoIcon className="w-8 h-8" />}
            </button>
          )}

          <div className="w-[1px] h-12 bg-white/10 mx-2" />

          <button
            onClick={endCall}
            className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-3xl transition-all active:scale-90 shadow-lg shadow-red-600/30 group"
          >
            <PhoneOff className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
