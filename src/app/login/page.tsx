import { FaArrowLeft, FaKey  } from 'react-icons/fa6';
import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black opacity-80" />
      
      <div className="absolute top-12 left-12 z-20">
        <Link 
          href="/main" 
          className="group flex items-center gap-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] hover:text-white transition-all"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white group-hover:bg-white/5 transition-all">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-white" size={16} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">Back to Archive</span>
        </Link>
      </div>
      <div className="relative z-10 w-full max-w-md space-y-20">
        <div className="text-center space-y-8">
          <div className="inline-block p-4 rounded-full border border-white/5 bg-white/5 mb-4">
             <FaKey className="text-white/20" size={20} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-serif italic tracking-[0.6em] text-white uppercase ml-[0.6em]">ATELIER</h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.8em]">Security Protocol v.1.2</p>
          </div>
        </div>
        <LoginForm />
      </div>
      
    </main>
  );
}
