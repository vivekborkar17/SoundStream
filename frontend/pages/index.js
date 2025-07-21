import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Audio Stream App - Home</title>
        <meta name="description" content="Real-time audio streaming application" />
      </Head>
      <div className="container">
        <div className="card">
          <h1>🎵 Audio Stream App</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.2rem', opacity: 0.9 }}>
            Share your tab audio in real-time with others
          </p>
          <Link href="/sender">
            <button className="button">🎙️ Start Streaming</button>
          </Link>
          <br />
          <Link href="/receiver">
            <button className="button">🔊 Join Stream</button>
          </Link>
        </div>
      </div>
    </>
  );
}