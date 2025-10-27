import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  // Check if user is signed in
  const { userId } = await auth();
  
  // Redirect to dashboard if signed in, otherwise to sign-in page
  if (userId) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}
