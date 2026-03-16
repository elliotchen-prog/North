import Head from "next/head";
import LifeAssistApp from "@/components/LifeAssistApp";

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Life Assistant</title>
        <meta name="description" content="Navigate everyday life problems with clear action plans." />
      </Head>
      <LifeAssistApp />
    </>
  );
}
