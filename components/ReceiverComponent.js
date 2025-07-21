import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ReceiverComponent() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [error, setError] = useState('');
  const [manualRoomId, setManualRoomId] = useState('');

  useEffect(() => {
    // Initialize AudioContext only on client side
    if (typeof window !== 'undefined') {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(context);
    }
  }, []);

  useEffect(() => {
    const code = router.query.room || manualRoomId;
    if (code && audioCtx) {
      connectToRoom(code);
    }
  }, [router.query.room, manualRoomId, audioCtx]);

  const connectToRoom = (code) => {
    try {
      setError('');
      setRoomId(code);
      // Connect to the same server that serves the Next.js app
      const socket = io();
      
      socket.emit('join-room', code);
      
      socket.on('connect', () => {
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('audio-chunk', async (data) => {
        try {
          if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const buffer = await audioCtx.decodeAudioData(reader.result);
              const source = audioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.destination);
              source.start(0);
            } catch (err) {
              console.error('Error playing audio:', err);
            }
          };
          reader.readAsArrayBuffer(data);
        } catch (err) {
          console.error('Error processing audio chunk:', err);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      setError('Failed to connect to the room. Please check the room code.');
      console.error('Connection error:', err);
    }
  };

  const handleManualJoin = () => {
    if (manualRoomId.trim()) {
      router.push(`/receiver?room=${manualRoomId.trim().toUpperCase()}`);
    }
  };

  const enableAudio = async () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  };

  return (
    <div className="container">
      <div className="card">
        <Link href="/">
          <button className="button" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            ← Back to Home
          </button>
        </Link>
        
        <h1>🔊 Join Audio Stream</h1>

        {!roomId ? (
          <div>
            <h2>Enter Room Code</h2>
            <div style={{ margin: '2rem 0' }}>
              <input
                type="text"
                placeholder="Enter room code..."
                value={manualRoomId}
                onChange={(e) => setManualRoomId(e.target.value.toUpperCase())}
                style={{
                  padding: '1rem',
                  fontSize: '1.2rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  textAlign: 'center',
                  marginRight: '1rem',
                  backdropFilter: 'blur(10px)',
                  minWidth: '200px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleManualJoin()}
              />
              <button className="button" onClick={handleManualJoin}>
                Join Room
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="room-code">
              Room: {roomId}
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(255, 99, 99, 0.2)', 
                padding: '1rem', 
                borderRadius: '10px', 
                margin: '1rem 0',
                border: '1px solid rgba(255, 99, 99, 0.5)'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ margin: '2rem 0' }}>
              {isConnected ? (
                <div>
                  <div style={{ margin: '1rem 0' }}>
                    <span className="status-indicator"></span>
                    <strong>Connected & Listening</strong>
                  </div>
                  <p style={{ opacity: 0.8 }}>
                    You're now connected to the audio stream!
                  </p>
                  <button className="button" onClick={enableAudio} style={{ marginTop: '1rem' }}>
                    🔊 Enable Audio (if needed)
                  </button>
                </div>
              ) : (
                <div>
                  <p>Connecting to room...</p>
                  <div style={{ 
                    margin: '1rem 0', 
                    opacity: 0.7,
                    animation: 'pulse 1.5s infinite'
                  }}>
                    Please wait while we connect you to the stream.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '2rem' }}>
          Make sure your device volume is turned up to hear the audio stream.
        </p>
      </div>
    </div>
  );
}
