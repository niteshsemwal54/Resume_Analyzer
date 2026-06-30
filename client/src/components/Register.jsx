import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:3000/api/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Registration successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-semibold">Create your account</h2>
        <p className="mt-2 text-sm text-slate-300">Join AI Resume Analyzer and get instant insights.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 outline-none" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500" type="submit">Register</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">Already registered? <Link className="text-blue-400" to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
