import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function History() {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  const loadResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/resume/history', { headers: { Authorization: `Bearer ${token}` } });
      setResumes(data.resumes);
    } catch (error) {
      toast.error('Unable to load history');
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Resume deleted');
      loadResumes();
    } catch (error) {
      toast.error('Could not delete resume');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">History</p>
            <h1 className="text-3xl font-semibold">Previous Analyses</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium">Dashboard</button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume._id} className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-400">{new Date(resume.createdAt).toLocaleDateString()}</p>
              <h3 className="mt-2 text-xl font-semibold">{resume.originalFilename}</h3>
              <div className="mt-4 rounded-2xl bg-slate-800/70 p-4">
                <p className="text-sm text-slate-400">ATS Score</p>
                <p className="text-3xl font-semibold">{resume.score}/100</p>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to={`/analysis/${resume._id}`} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold">View Analysis</Link>
                {/* <button onClick={() => handleDelete(resume._id)} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold">Delete</button>
               */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;
