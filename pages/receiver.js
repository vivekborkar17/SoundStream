import Head from 'next/head';
import ReceiverComponent from '../components/ReceiverComponent';

export default function ReceiverPage() {
  return (
    <>
      <Head>
        <title>Audio Stream App - Join Stream</title>
        <meta name="description" content="Join and listen to an audio stream" />
      </Head>
      <ReceiverComponent />
    </>
  );
}
