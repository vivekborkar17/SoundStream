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
  const [socket, setSocket] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);

  useEffect(() => {
    // Initialize AudioContext only on client side
    if (typeof window !== 'undefined') {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(context);
    }
  }, []);

  useEffect(() => {
    const code = router.query.room;
    if (code && audioCtx) {
      setManualRoomId(code);
      connectToRoom(code);
    }
  }, [router.query.room, audioCtx]);

  const connectToRoom = async (code) => {
    try {
      setError('');
      setRoomId(code);
      
      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }
      
      // Initialize socket connection
      await fetch('/api/socket');
      const newSocket = io();
      setSocket(newSocket);
      
      newSocket.emit('join-room', code);
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });
      
      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setIsReceivingAudio(false);
        console.log('Disconnected from server');
      });

      newSocket.on('audio-chunk', async (data) => {
        try {
          setIsReceivingAudio(true);
          
          if (audioCtx && audioCtx.state === 'suspended') {
            await audioCtx.resume();
            setIsAudioEnabled(true);
          }
          
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const audioBuffer = await audioCtx.decodeAudioData(reader.result);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.start(0);
            } catch (err) {
              console.error('Error playing audio:', err);
              if (err.name === 'InvalidStateError') {
                // Try to resume audio context
                await audioCtx.resume();
              }
            }
          };
          reader.readAsArrayBuffer(data);
        } catch (err) {
          console.error('Error processing audio chunk:', err);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    } catch (err) {
      setError('Failed to connect to the room. Please check the room code.');
      console.error('Connection error:', err);
    }
  };

  const handleManualJoin = () => {
    if (manualRoomId.trim()) {
      const code = manualRoomId.trim().toUpperCase();
      router.push(`/receiver?room=${code}`);
    }
  };

  const enableAudio = async () => {
    try {
      if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
        setIsAudioEnabled(true);
      }
    } catch (err) {
      console.error('Error enabling audio:', err);
      setError('Failed to enable audio. Please try refreshing the page.');
    }
  };

  const openQRScanner = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowQRScanner(true);
    } else {
      setError('Camera not available. Please enter the room code manually or open the shared link.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualJoin();
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
            <h2>Join a Stream</h2>
            
            {/* QR Code Scanning Instructions */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem', 
              borderRadius: '15px', 
              margin: '1.5rem 0' 
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📱 How to Join:</h3>
              <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                <p><strong>Method 1:</strong> Scan QR code with your phone camera</p>
                <p><strong>Method 2:</strong> Enter room code manually below</p>
                <p><strong>Method 3:</strong> Open the shared link directly</p>
              </div>
            </div>

            <div style={{ margin: '2rem 0' }}>
              <input
                type="text"
                placeholder="Enter 6-digit room code..."
                value={manualRoomId}
                onChange={(e) => setManualRoomId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={6}
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  backdropFilter: 'blur(10px)',
                  width: '200px',
                  letterSpacing: '0.2em',
                  fontWeight: 'bold'
                }}
              />
              <br />
              <button className="button" onClick={handleManualJoin} disabled={!manualRoomId.trim()}>
                🚀 Join Room
              </button>
            </div>

            <div style={{ margin: '1rem 0', opacity: 0.7 }}>
              <p>📱 <strong>For Phone Users:</strong> Simply point your camera at the QR code shown on the streaming device</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="room-code">
              Connected to Room: {roomId}
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
                    <strong style={{ fontSize: '1.1rem' }}>✅ Connected to Stream</strong>
                  </div>
                  
                  {isReceivingAudio ? (
                    <div style={{ 
                      background: 'rgba(76, 175, 80, 0.2)', 
                      padding: '1rem', 
                      borderRadius: '10px', 
                      margin: '1rem 0',
                      border: '1px solid rgba(76, 175, 80, 0.5)'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🔴 LIVE</span>
                      <br />
                      <strong>Receiving Audio Stream!</strong>
                    </div>
                  ) : (
                    <div style={{ 
                      background: 'rgba(255, 193, 7, 0.2)', 
                      padding: '1rem', 
                      borderRadius: '10px', 
                      margin: '1rem 0',
                      border: '1px solid rgba(255, 193, 7, 0.5)'
                    }}>
                      ⏳ Waiting for audio stream to start...
                      <br />
                      <small>Ask the host to start streaming</small>
                    </div>
                  )}
                  
                  {!isAudioEnabled && (
                    <button className="button" onClick={enableAudio} style={{ marginTop: '1rem' }}>
                      🔊 Enable Audio
                    </button>
                  )}
                  
                  <div style={{ marginTop: '1.5rem', opacity: 0.8 }}>
                    <p>🎧 Make sure your device volume is turned up</p>
                    <p>📱 Keep this tab open to continue listening</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p>🔄 Connecting to room {roomId}...</p>
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
      </div>
    </div>
  );
}
