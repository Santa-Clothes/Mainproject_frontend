import Link from "next/link";
import { FaArrowRight, FaShieldHalved } from "react-icons/fa6";
import { useRouter } from "next/router";

export default function SignupForm() {
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/main");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="group relative border-b border-white/10 focus-within:border-white transition-colors py-4">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Designation"
                  className="w-full bg-transparent border-none outline-none text-white text-base font-light placeholder:text-neutral-800 tracking-widest py-2"
                  required
                />
              </div>
              <div className="group relative border-b border-white/10 focus-within:border-white transition-colors py-4">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Identity</label>
                <input 
                  type="email" 
                  placeholder="name@atelier.so"
                  className="w-full bg-transparent border-none outline-none text-white text-base font-light placeholder:text-neutral-800 tracking-widest py-2"
                  required
                />
              </div>
              <div className="group relative border-b border-white/10 focus-within:border-white transition-colors py-4">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Set Protocol Key</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-none outline-none text-white text-base font-light placeholder:text-neutral-800 tracking-widest py-2"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-10">
              <button 
                type="submit"
                className="w-full py-7 bg-white text-black text-[11px] font-bold uppercase tracking-[0.8em] hover:bg-neutral-200 transition-all flex items-center justify-center gap-6 group shadow-2xl active:scale-95"
              >
                Register <FaArrowRight className="group-hover:translate-x-3 transition-transform" />
              </button>
              
              <div className="flex flex-col items-center gap-6">
                <Link href="/login" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  Already a Curator? Log In
                </Link>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                  <FaShieldHalved size={14} className="opacity-40" /> 256-bit Encrypted
                </div>
              </div>
            </div>
          </form>
    </>
  );
}