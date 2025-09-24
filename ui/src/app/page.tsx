import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function Home() {
  return (
    <ProtectedRoute>
      <Header />
    </ProtectedRoute>
  );
}