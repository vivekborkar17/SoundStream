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
  const [testMode, setTestMode] = useState(false);

  // Add test function to check permissions
  const testScreenShare = async () => {
    try {
      setTestMode(true);
      setError('');
      
      console.log('Testing MediaRecorder support...');
      
      // Test MediaRecorder support first
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      }
      
      const testStream = await navigator.mediaDevices.getDisplayMedia({ 
        audio: true,
        video: true 
      });
      
      const audioTracks = testStream.getAudioTracks();
      const videoTracks = testStream.getVideoTracks();
      
      console.log('Stream test results:', {
        audioTracks: audioTracks.length,
        videoTracks: videoTracks.length,
        audioSettings: audioTracks[0]?.getSettings(),
        videoSettings: videoTracks[0]?.getSettings()
      });
      
      if (audioTracks.length === 0) {
        setError('⚠️ No audio track found. Make sure to check "Share tab audio" checkbox and ensure audio is playing in the selected tab.');
        testStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      // Test MediaRecorder with the stream
      try {
        console.log('Testing MediaRecorder creation...');
        
        // Test with different MIME types
        const testTypes = ['audio/webm', 'audio/mp4', ''];
        let testRecorder = null;
        let workingType = null;
        
        for (const type of testTypes) {
          try {
            const options = type ? { mimeType: type } : {};
            testRecorder = new MediaRecorder(testStream, options);
            workingType = type || 'default';
            console.log(`MediaRecorder test successful with: ${workingType}`);
            break;
          } catch (err) {
            console.log(`MediaRecorder failed with ${type || 'default'}:`, err);
          }
        }
        
        if (!testRecorder) {
          throw new Error('MediaRecorder failed to initialize with any supported format.');
        }
        
        // Test start/stop
        console.log('Testing MediaRecorder start/stop...');
        testRecorder.start(1000);
        
        setTimeout(() => {
          testRecorder.stop();
          setError(`✅ Complete test successful! 
          - Screen sharing: ✅ Working
          - Audio track: ✅ Found
          - MediaRecorder: ✅ Working (${workingType})
          - Ready to stream!`);
        }, 2000);
        
      } catch (recorderErr) {
        console.error('MediaRecorder test failed:', recorderErr);
        setError(`❌ MediaRecorder test failed: ${recorderErr.message}
        
        Try:
        - Using Chrome browser (recommended)
        - Updating your browser
        - Checking if other apps are using audio`);
      }
      
      // Stop test stream after delay
      setTimeout(() => {
        testStream.getTracks().forEach(track => track.stop());
      }, 3000);
      
    } catch (err) {
      console.error('Test failed:', err);
      if (err.name === 'NotAllowedError') {
        setError('❌ Test failed: Permission denied. Please allow screen sharing when prompted.');
      } else {
        setError(`❌ Test failed: ${err.message}`);
      }
    } finally {
      setTimeout(() => setTestMode(false), 2000);
    }
  };

  useEffect(() => {
    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError('❌ Your browser doesn\'t support screen sharing. Please use Chrome, Firefox, or Edge.');
      return;
    }

    if (!window.MediaRecorder) {
      setError('❌ Your browser doesn\'t support MediaRecorder. Please use Chrome (recommended), Firefox, or Edge.');
      return;
    }

    // Check if we're on mobile (streaming not supported on mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setError('❌ Audio streaming is not supported on mobile devices. Please use a desktop/laptop browser. Mobile devices can join streams as listeners.');
      return;
    }

    const id = uuidv4().slice(0, 6).toUpperCase();
    setRoomId(id);
    
    // Initialize socket connection
    const initSocket = async () => {
      try {
        await fetch('/api/socket');
        const sock = io();
        setSocket(sock);
        sock.emit('create-room', id);
        
        sock.on('connect', () => {
          console.log('Connected to server');
        });
        
        sock.on('disconnect', () => {
          console.log('Disconnected from server');
        });
        
      } catch (err) {
        console.error('Socket connection failed:', err);
        setError('❌ Failed to connect to server. Please refresh the page and try again.');
      }
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
      
      // Request screen share with audio - try different configurations
      let displayStream;
      
      try {
        // First attempt: Request with specific audio constraints
        displayStream = await navigator.mediaDevices.getDisplayMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 44100,
            channelCount: 2
          },
          video: {
            mediaSource: 'tab',
            width: { ideal: 1 },
            height: { ideal: 1 }
          }
        });
      } catch (err) {
        console.log('First attempt failed, trying simpler request:', err);
        // Second attempt: Simple request
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({ 
            audio: true,
            video: true
          });
        } catch (err2) {
          console.log('Second attempt failed, trying audio-only:', err2);
          // Third attempt: Focus on audio
          displayStream = await navigator.mediaDevices.getDisplayMedia({ 
            audio: {
              mandatory: {
                chromeMediaSource: 'tab',
                echoCancellation: false
              }
            },
            video: {
              mandatory: {
                chromeMediaSource: 'tab',
                maxWidth: 1,
                maxHeight: 1
              }
            }
          });
        }
      }
      
      setStream(displayStream);
      
      // Check if audio track is available
      const audioTracks = displayStream.getAudioTracks();
      console.log('Audio tracks found:', audioTracks.length);
      
      if (audioTracks.length === 0) {
        displayStream.getTracks().forEach(track => track.stop());
        throw new Error('No audio track detected. Please make sure to:\n1. Select a tab that is currently playing audio\n2. Check the "Share tab audio" checkbox\n3. Make sure audio is actually playing in the selected tab');
      }
      
      // Log audio track info
      audioTracks.forEach((track, index) => {
        console.log(`Audio track ${index}:`, {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        });
      });
      
      // Determine the best MIME type with extensive fallbacks
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm;codecs=vp8,opus',
        'audio/webm',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
        '' // Empty string as final fallback
      ];
      
      let mimeType = '';
      for (const type of supportedTypes) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log('Using MIME type:', mimeType || 'browser default');
          break;
        }
      }
      
      // Create MediaRecorder with progressive fallback options
      let recorder;
      let recorderOptions = {};
      
      // Try with specific MIME type and bitrate
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      
      try {
        // First attempt: with bitrate
        recorderOptions.audioBitsPerSecond = 128000;
        recorder = new MediaRecorder(displayStream, recorderOptions);
        console.log('MediaRecorder created with bitrate');
      } catch (err1) {
        console.log('Failed with bitrate, trying without:', err1);
        try {
          // Second attempt: without bitrate
          delete recorderOptions.audioBitsPerSecond;
          recorder = new MediaRecorder(displayStream, recorderOptions);
          console.log('MediaRecorder created without bitrate');
        } catch (err2) {
          console.log('Failed with MIME type, trying default:', err2);
          try {
            // Third attempt: default settings only
            recorder = new MediaRecorder(displayStream);
            console.log('MediaRecorder created with default settings');
          } catch (err3) {
            console.error('All MediaRecorder attempts failed:', err3);
            throw new Error('MediaRecorder not supported or failed to initialize. Please try a different browser or update your current browser.');
          }
        }
      }
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket) {
          console.log('Sending audio chunk, size:', e.data.size);
          socket.emit('audio-chunk', { roomId, chunk: e.data });
        }
      };
      
      recorder.onstart = () => {
        setIsStreaming(true);
        console.log('Recording started successfully');
      };
      
      recorder.onstop = () => {
        setIsStreaming(false);
        console.log('Recording stopped');
      };
      
      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('Recording error occurred. Please try again.');
        setIsStreaming(false);
      };
      
      // Handle stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        console.log('Screen share ended by user');
        stopStreaming();
      };
      
      // Monitor audio track status
      audioTracks[0].onended = () => {
        console.log('Audio track ended');
        setError('Audio sharing was stopped. Please restart streaming.');
        stopStreaming();
      };
      
      setMediaRecorder(recorder);
      
      // Start recording with error handling
      try {
        recorder.start(100); // Try 100ms chunks first
        console.log('Recording started with 100ms chunks');
      } catch (startErr) {
        console.log('Failed with 100ms chunks, trying 250ms:', startErr);
        try {
          recorder.start(250); // Fallback to 250ms chunks
          console.log('Recording started with 250ms chunks');
        } catch (startErr2) {
          console.log('Failed with 250ms chunks, trying 1000ms:', startErr2);
          try {
            recorder.start(1000); // Fallback to 1 second chunks
            console.log('Recording started with 1000ms chunks');
          } catch (startErr3) {
            console.log('Failed with timed chunks, trying default:', startErr3);
            try {
              recorder.start(); // Try without specifying interval
              console.log('Recording started with default settings');
            } catch (startErr4) {
              console.error('All start attempts failed:', startErr4);
              throw new Error('Failed to start recording. This might be due to browser limitations or codec issues. Try using Chrome browser or check if another application is using your microphone.');
            }
          }
        }
      }
      
      // Success message
      console.log('Streaming started successfully');
      
    } catch (err) {
      console.error('Error starting stream:', err);
      setIsStreaming(false);
      setShowInstructions(true);
      
      // Provide specific error messages
      if (err.name === 'NotAllowedError') {
        setError('❌ Permission denied! Please:\n• Click "Share" when the browser asks\n• Select a tab that is playing audio\n• Check "Share tab audio" checkbox\n• Try again');
      } else if (err.name === 'NotFoundError') {
        setError('❌ No audio source found! Please:\n• Make sure audio is actually playing in the selected tab\n• Try refreshing the tab with audio\n• Check your system audio is not muted');
      } else if (err.name === 'NotSupportedError') {
        setError('❌ Screen sharing not supported! Please:\n• Use Chrome, Firefox, or Edge browser\n• Make sure you\'re on a secure connection (HTTPS)\n• Try updating your browser');
      } else if (err.name === 'AbortError') {
        setError('❌ Screen sharing was cancelled. Please try again and select "Share" when prompted.');
      } else {
        setError(`❌ Streaming failed: ${err.message}\n\nTroubleshooting:\n• Make sure audio is playing in the tab\n• Check "Share tab audio" when prompted\n• Try using Chrome browser for best compatibility`);
      }
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
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', color: '#ffeb3b' }}>
              🎯 STEP-BY-STEP GUIDE:
            </h3>
            <div style={{ background: 'rgba(255, 193, 7, 0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <strong style={{ color: '#ffc107' }}>BEFORE clicking "Start":</strong>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginTop: '0.5rem' }}>
                <li>Open Spotify, Netflix, YouTube, or any app with audio</li>
                <li><strong>Make sure audio is actually playing</strong> 🔊</li>
                <li>Keep that tab/window open</li>
              </ol>
            </div>
            
            <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '1rem', borderRadius: '10px' }}>
              <strong style={{ color: '#4caf50' }}>WHEN you click "Start":</strong>
              <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', marginTop: '0.5rem' }}>
                <li>Browser will ask "Choose what to share"</li>
                <li>Click the <strong>"Chrome Tab"</strong> option (not "Entire Screen")</li>
                <li>Select the tab with your audio (Spotify, Netflix, etc.)</li>
                <li><strong>✅ CHECK the "Share tab audio" checkbox</strong></li>
                <li>Click <strong>"Share"</strong> button</li>
              </ol>
            </div>
            
            <p style={{ 
              marginTop: '1rem', 
              textAlign: 'center', 
              color: '#ff5722',
              fontWeight: 'bold',
              background: 'rgba(255, 87, 34, 0.2)',
              padding: '0.8rem',
              borderRadius: '8px'
            }}>
              ⚠️ Most important: Don't forget to check "Share tab audio"!
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
          <div>
            <button 
              className="button" 
              onClick={testScreenShare} 
              disabled={testMode}
              style={{ 
                fontSize: '1rem', 
                padding: '0.8rem 1.5rem',
                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                marginRight: '1rem'
              }}
            >
              {testMode ? '🔄 Testing...' : '🧪 Test Screen Share'}
            </button>
            <button 
              className="button" 
              onClick={startStreaming} 
              style={{ fontSize: '1.2rem', padding: '1.2rem 2.5rem' }}
            >
              🎵 Start Tab Audio Streaming
            </button>
            <p style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
              💡 Try the test button first to check if screen sharing works
            </p>
          </div>
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
