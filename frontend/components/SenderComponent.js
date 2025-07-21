import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode.react';
import Link from 'next/link';

export default function SenderComponent() {
  const [roomId, setRoomId] = useState('');
  const [socket, setSocket] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    const id = uuidv4().slice(0, 6).toUpperCase();
    setRoomId(id);
    const sock = io('http://localhost:3001');
    setSocket(sock);
    sock.emit('create-room', id);

    return () => {
      if (sock) sock.disconnect();
      if (mediaRecorder) mediaRecorder.stop();
    };
  }, []);

  const startStreaming = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        audio: true,
        video: false 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket) {
          socket.emit('audio-chunk', { roomId, chunk: e.data });
        }
      };
      
      recorder.onstart = () => {
        setIsStreaming(true);
      };
      
      recorder.onstop = () => {
        setIsStreaming(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start(250);
      
    } catch (err) {
      setError('Failed to start streaming. Please make sure you grant permission to share tab audio.');
      console.error('Error starting stream:', err);
    }
  };

  const stopStreaming = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const receiverURL = `${window.location.origin}/receiver?room=${roomId}`;

  return (
    <div className="container">
      <div className="card">
        <Link href="/">
          <button className="button" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            ← Back to Home
          </button>
        </Link>
        
        <h1>🎙️ Audio Streaming</h1>
        
        <div className="room-code">
          Room Code: {roomId}
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

        {!isStreaming ? (
          <button className="button" onClick={startStreaming}>
            🎵 Start Tab Audio Streaming
          </button>
        ) : (
          <div>
            <div style={{ margin: '1rem 0' }}>
              <span className="status-indicator"></span>
              <strong>Streaming Active</strong>
            </div>
            <button 
              className="button" 
              onClick={stopStreaming}
              style={{ background: 'linear-gradient(45deg, #ff4757, #ff3838)' }}
            >
              🛑 Stop Streaming
            </button>
          </div>
        )}

        <h2>Share with others:</h2>
        
        <div className="qr-container">
          <QRCode value={receiverURL} size={180} />
        </div>
        
        <div className="url-display">
          {receiverURL}
        </div>
        
        <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '1rem' }}>
          Others can scan the QR code or visit the URL to join your stream
        </p>
      </div>
    </div>
  );
}