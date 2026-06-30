import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function AnalysisDetails() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResume = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:3000/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setResume(data.resume);
      } catch (error) {
        toast.error('Unable to load analysis');
      }
    };
    loadResume();
  }, [id]);

  if (!resume) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading analysis...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <button onClick={() => navigate('/history')} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium">Back to History</button>
        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Analysis Details</p>
              <h1 className="text-3xl font-semibold">{resume.originalFilename}</h1>
              <p className="mt-2 text-slate-300">Uploaded on {new Date(resume.createdAt).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-center">
              <p className="text-sm text-slate-300">ATS Score</p>
              <p className="text-4xl font-semibold">{resume.score}/100</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-4 text-slate-300">{resume.summary}</p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Strengths</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
              {resume.strengths?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Weaknesses</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
              {resume.weaknesses?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Missing Skills</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
              {resume.missingSkills?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold">Suggestions</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
            {resume.suggestions?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AnalysisDetails;
