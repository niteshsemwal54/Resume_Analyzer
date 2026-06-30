import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:3000/api/resume/history', { headers: { Authorization: `Bearer ${token}` } });
        setRecent(data.resumes?.[0] || null);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRecent();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Select a PDF file');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:3000/api/resume/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume analyzed successfully');
      navigate(`/analysis/${data.resume._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">AI Resume Analyzer</p>
            <h1 className="mt-2 text-3xl font-semibold">Hello, {user.name || 'there'}</h1>
            <p className="mt-2 text-slate-300">Upload a PDF resume and get an ATS-focused analysis instantly.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/history" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium">View History</Link>
            <button onClick={handleLogout} className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-medium">Logout</button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Upload Resume</h2>
            <p className="mt-2 text-sm text-slate-300">PDF resumes only. Files up to 5MB are accepted.</p>
            <form onSubmit={handleUpload} className="mt-6 space-y-4">
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-blue-400/40 bg-gradient-to-br from-slate-800/80 to-slate-700/70 p-8 text-center transition hover:border-blue-300 hover:bg-slate-700/80">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-3xl text-blue-300">📄</div>
                <span className="mt-4 text-lg font-semibold text-white">Drop your resume here</span>
                <span className="mt-2 text-sm text-slate-400">or click to browse PDF files</span>
                <span className="mt-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                  {file ? file.name : 'No file selected'}
                </span>
                <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Latest Result</h2>
            {recent ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                  <p className="text-sm text-slate-400">Resume</p>
                  <p className="mt-1 font-semibold">{recent.originalFilename}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-4">
                  <p className="text-sm text-slate-400">ATS Score</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${recent.score || 0}%` }}></div>
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{recent.score || 0}/100</p>
                </div>
                <Link to={`/analysis/${recent._id}`} className="block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-medium">View Analysis</Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No resumes uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
