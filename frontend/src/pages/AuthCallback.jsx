// C:\Users\Siddharathan\Desktop\salon-booking-full-stack\frontend\src\pages\AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // ✅ Save token to localStorage (same key your app uses)
      localStorage.setItem('token', token);

      // ✅ Redirect to home page (change '/' to wherever your app goes after login)
      navigate('/');
    } else {
      // ✅ Redirect to login with error message
      navigate('/login?error=' + (error || 'google_login_failed'));
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Logging you in with Google...</p>
      </div>
    </div>
  );
}
