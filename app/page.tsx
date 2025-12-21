import { ensureSeed } from './actions';
import HomeClient from './HomeClient';

export default async function Home() {
  try {
    await ensureSeed();
  } catch (e) {
    console.log("DB not ready yet, skipping seed");
  }

  return <HomeClient />;
}
