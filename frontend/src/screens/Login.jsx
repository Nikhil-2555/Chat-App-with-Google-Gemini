import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/user.context';
import { Mail, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useUser();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 font-sans selection:bg-blue-500/30">
            {/* Subtle Gradient Spot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] p-8 rounded-2xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                        <LayoutDashboard size={28} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
                    <p className="text-zinc-400 text-sm">Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Email address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-600"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-xl py-3.5 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-600"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-zinc-500 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline underline-offset-4 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
