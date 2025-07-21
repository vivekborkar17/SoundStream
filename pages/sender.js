import Head from 'next/head';
import SenderComponent from '../components/SenderComponent';

export default function SenderPage() {
  return (
    <>
      <Head>
        <title>Audio Stream App - Start Streaming</title>
        <meta name="description" content="Start streaming your tab audio" />
      </Head>
      <SenderComponent />
    </>
  );
}
