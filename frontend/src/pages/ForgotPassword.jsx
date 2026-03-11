import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Assuming backend URL matches
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage('Password reset email sent (check console/logs for simulated email if not configured).');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error sending email');
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
                </div>

                {message && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">{message}</div>}
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Send Reset Link
                    </button>
                </form>

                <div className="text-center">
                    <Link to="/login" className="flex items-center justify-center text-gray-600 hover:text-gray-900 text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
