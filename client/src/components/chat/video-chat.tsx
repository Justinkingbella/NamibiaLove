
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, ArrowLeft } from 'lucide-react';
import Peer from 'simple-peer';
import { useWebSocket } from '@/hooks/use-websocket';

interface VideoChatProps {
  otherUserId: number;
  onClose: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({ otherUserId, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  const { sendSignal } = useWebSocket(null, {
    onSignal: (data) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    }
  });

  useEffect(() => {
    const startMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: mediaStream
        });

        peer.on('signal', (data) => {
          sendSignal(otherUserId, data);
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        peerRef.current = peer;
      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [otherUserId]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="relative flex-1">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-1/3 h-1/3 rounded-2xl object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-black/50 text-white"
          onClick={onClose}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="bg-black/90 p-4 flex justify-center items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500' : 'bg-white/10'}`}
          onClick={toggleMute}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={onClose}
        >
          <PhoneOff className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full w-12 h-12 ${isCameraOff ? 'bg-red-500' : 'bg-white/10'}`}
          onClick={toggleCamera}
        >
          {isCameraOff ? (
            <CameraOff className="h-6 w-6 text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
