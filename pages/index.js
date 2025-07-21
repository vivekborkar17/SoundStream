import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Audio Stream App - Stream Your Audio</title>
        <meta name="description" content="Stream audio from Spotify, Netflix, YouTube to any device in real-time" />
      </Head>
      <div className="container">
        <div className="card">
          <h1>🎵 Multi-Device Audio Streaming</h1>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem', opacity: 0.9 }}>
            Stream audio from your laptop to any device
          </p>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '15px', 
            margin: '1.5rem 0',
            textAlign: 'left' 
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>🚀 How it works:</h3>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>Stream:</strong> Play Spotify, Netflix, YouTube on your laptop</li>
              <li><strong>Share:</strong> Generate a room code and QR code</li>
              <li><strong>Connect:</strong> Other devices scan QR or enter code</li>
              <li><strong>Enjoy:</strong> Audio plays on all connected devices!</li>
            </ol>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link href="/sender">
              <button className="button" style={{ fontSize: '1.2rem', padding: '1.2rem 2.5rem', marginBottom: '1rem' }}>
                🎙️ Start Streaming Audio
              </button>
            </Link>
            <br />
            <Link href="/receiver">
              <button className="button" style={{ fontSize: '1.2rem', padding: '1.2rem 2.5rem' }}>
                � Join Stream
              </button>
            </Link>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            opacity: 0.8, 
            fontSize: '0.9rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1rem',
            borderRadius: '10px'
          }}>
            <p><strong>Perfect for:</strong></p>
            <p>🏠 Home parties • 🎬 Movie nights • 🎮 Gaming sessions • 📺 TV shows</p>
          </div>
        </div>
      </div>
    </>
  );
}
