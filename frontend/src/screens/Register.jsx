import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useUser } from '../context/user.context';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useUser();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await register(formData.username, formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Registration failed. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-950 via-gray-900 to-black text-white selection:bg-pink-500 selection:text-white relative overflow-hidden py-12">

            {/* Ambient Background Glows */}
            <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-pink-600/10 blur-[120px] animate-pulse"></div>
            <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse delay-700"></div>

            {/* Glassmorphism Card */}
            <div className="w-full max-w-md px-8 py-10 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] relative z-10 transition-all duration-500 hover:border-white/20 mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 mb-4">
                        <User className="h-6 w-6 text-pink-400" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join our amazing community today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username Field */}
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-pink-400 transition-colors duration-200" />
                        <input
                            type="text"
                            name="username"
                            required
                            autoComplete="username"
                            placeholder="Full Name"
                            className="w-full bg-black/20 border border-white/10 text-gray-100 text-sm rounded-xl py-4 pl-12 pr-4 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all duration-300 placeholder:text-gray-500 hover:bg-black/30"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email Field */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-pink-400 transition-colors duration-200" />
                        <input
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            placeholder="Email Address"
                            className="w-full bg-black/20 border border-white/10 text-gray-100 text-sm rounded-xl py-4 pl-12 pr-4 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all duration-300 placeholder:text-gray-500 hover:bg-black/30"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-pink-400 transition-colors duration-200" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            autoComplete="new-password"
                            placeholder="Password"
                            className="w-full bg-black/20 border border-white/10 text-gray-100 text-sm rounded-xl py-4 pl-12 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all duration-300 placeholder:text-gray-500 hover:bg-black/30"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium py-4 px-4 rounded-xl shadow-lg shadow-pink-500/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-pink-500/50 active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            {isLoading ? 'Creating Account...' : 'Get Started'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-pink-400 font-medium hover:text-pink-300 transition-colors hover:underline decoration-pink-400/50 underline-offset-4">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
