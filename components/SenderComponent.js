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
  const [stream, setStream] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const id = uuidv4().slice(0, 6).toUpperCase();
    setRoomId(id);
    
    // Initialize socket connection
    const initSocket = async () => {
      await fetch('/api/socket');
      const sock = io();
      setSocket(sock);
      sock.emit('create-room', id);
    };
    
    initSocket();

    return () => {
      if (socket) socket.disconnect();
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStreaming = async () => {
    try {
      setError('');
      setShowInstructions(false);
      
      // Request screen share with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100
        },
        video: {
          width: 1,
          height: 1
        }
      });
      
      setStream(displayStream);
      
      // Check if audio track is available
      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track found. Please make sure to share a tab with audio and check "Share tab audio" checkbox.');
      }
      
      // Create MediaRecorder with optimized settings
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }
      
      const recorder = new MediaRecorder(displayStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket) {
          socket.emit('audio-chunk', { roomId, chunk: e.data });
        }
      };
      
      recorder.onstart = () => {
        setIsStreaming(true);
        console.log('Recording started');
      };
      
      recorder.onstop = () => {
        setIsStreaming(false);
        console.log('Recording stopped');
      };
      
      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error occurred. Please try again.');
      };
      
      // Handle stream ending
      displayStream.getVideoTracks()[0].onended = () => {
        stopStreaming();
      };
      
      setMediaRecorder(recorder);
      recorder.start(100); // Send chunks every 100ms for better real-time performance
      
    } catch (err) {
      console.error('Error starting stream:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Please allow screen sharing and make sure to check "Share tab audio" when prompted.');
      } else if (err.name === 'NotFoundError') {
        setError('No audio source found. Please share a tab that is playing audio.');
      } else {
        setError(`Failed to start streaming: ${err.message}`);
      }
      setShowInstructions(true);
    }
  };

  const stopStreaming = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsStreaming(false);
  };

  const receiverURL = `${typeof window !== 'undefined' ? window.location.origin : ''}/receiver?room=${roomId}`;

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

        {showInstructions && !isStreaming && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '15px', 
            margin: '1rem 0',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>📋 How to Stream Audio:</h3>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Start playing audio on Spotify, Netflix, YouTube, or any app</li>
              <li>Click "Start Tab Audio Streaming" below</li>
              <li>Select the tab that's playing audio</li>
              <li><strong>⚠️ IMPORTANT: Check "Share tab audio" checkbox</strong></li>
              <li>Click "Share" to begin streaming</li>
            </ol>
            <p style={{ marginTop: '1rem', fontStyle: 'italic', textAlign: 'center', color: '#ffeb3b' }}>
              💡 Make sure audio is actually playing before starting!
            </p>
          </div>
        )}

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
          <button className="button" onClick={startStreaming} style={{ fontSize: '1.2rem', padding: '1.2rem 2.5rem' }}>
            🎵 Start Tab Audio Streaming
          </button>
        ) : (
          <div>
            <div style={{ margin: '1.5rem 0' }}>
              <span className="status-indicator"></span>
              <strong style={{ fontSize: '1.2rem' }}>🔴 LIVE - Streaming Active</strong>
            </div>
            <p style={{ margin: '1rem 0', opacity: 0.9 }}>
              Your audio is now being streamed to all connected devices!
            </p>
            <button 
              className="button" 
              onClick={stopStreaming}
              style={{ background: 'linear-gradient(45deg, #ff4757, #ff3838)' }}
            >
              🛑 Stop Streaming
            </button>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2>📱 Share with others:</h2>
          
          <div className="qr-container">
            <QRCode value={receiverURL} size={200} />
          </div>
          
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '1rem 0' }}>
            Room Code: <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '5px' }}>{roomId}</span>
          </p>
          
          <div className="url-display">
            {receiverURL}
          </div>
          
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '1rem' }}>
            📱 Others can scan the QR code with their phone camera or visit the URL to join your stream
          </p>
        </div>
      </div>
    </div>
  );
}
