import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/tickets');
  // redirect('/auth/login')
}