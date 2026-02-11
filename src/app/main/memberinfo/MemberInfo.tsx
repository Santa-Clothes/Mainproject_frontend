'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { updateMemberAPI, updatePasswordAPI, deleteMemberAPI } from '@/app/api/memberService/memberapi';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaTrash, FaCamera, FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6';
import Image from 'next/image';

/**
 * MemberInfo: 사용자의 프로필 정보를 확인하고 수정하는 전역 관리 페이지입니다.
 * 프로필 이미지, 닉네임, 비밀번호(로컬전용) 수정 및 회원 탈퇴 기능을 제공합니다.
 */
export default function MemberInfo() {
  const [auth, setAuth] = useAtom(authUserAtom);
  const router = useRouter();

  // 상태 관리
  const [nickname, setNickname] = useState(auth?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(auth?.profile || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // OAuth2 계정 여부 판단
  const isOAuth2 = auth?.provider && auth.provider !== 'local';

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth) {
      router.push('/login');
    }
  }, [auth, router]);

  // 프로필 이미지 변경 핸들러 (파일 시뮬레이션)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 업데이트 핸들러
  const handleUpdateImage = async () => {
    if (!auth) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateMemberAPI(auth.accessToken, {
        profile: profileImage
      });

      if (result) {
        setAuth({ ...auth, profile: profileImage });
        setMessage({ type: 'success', text: 'Profile image updated.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update image.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 닉네임 업데이트 핸들러
  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateMemberAPI(auth.accessToken, {
        nickname
      });

      if (result) {
        setAuth({ ...auth, name: nickname });
        setMessage({ type: 'success', text: 'Nickname updated.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update nickname.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비밀번호 변경 (로컬 계정 전용)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isOAuth2) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePasswordAPI(auth.accessToken, newPassword);
      if (result) {
        setMessage({ type: 'success', text: 'Password changed successfully.' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Failed to change password.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error Occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    if (!auth) return;
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    try {
      const result = await deleteMemberAPI(auth.accessToken);
      if (result) {
        setAuth(null);
        router.push('/login');
      } else {
        alert('Account deletion failed.');
      }
    } catch (error) {
      alert('Error occurred during account deletion.');
    }
  };

  if (!auth) return null;

  const isImageChanged = profileImage !== auth.profile;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-6">
      {/* 상단 헤더 섹션 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif italic text-neutral-900 dark:text-white">Curator Profile</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Neural Interface & Identity Management</p>
        <div className="h-px w-20 bg-violet-500 mt-4"></div>
      </div>

      {/* 메시지 알림 */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400'
          }`}>
          {message.type === 'success' ? <FaCircleCheck size={16} /> : <FaTriangleExclamation size={16} />}
          <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 왼쪽: 프로필 이미지 수정 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="relative group mx-auto w-48 h-48 lg:w-full lg:h-auto aspect-square rounded-[3rem] overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-2xl transition-transform hover:scale-[1.02]">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <FaUser size={60} />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
              >
                <FaCamera size={30} className="text-white mb-2" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Visual</span>
              </button>
            </div>

            {isImageChanged && (
              <button
                onClick={handleUpdateImage}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-violet-500 transition-all animate-in fade-in slide-in-from-top-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Syncing...' : 'Apply Image Change'}
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-white/5 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Authentication Method</label>
              <p className="text-xs font-black text-violet-600 uppercase tracking-wider">{auth.provider || 'LOCAL'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">User ID</label>
              <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{auth.userId}</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 수정 폼 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 닉네임 수정 섹션 */}
          <section className="p-8 rounded-[2.5rem] bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                <FaUser size={14} />
              </div>
              <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">Nickname</h2>
            </div>

            <form onSubmit={handleUpdateNickname} className="space-y-6">
              <div className="space-y-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                  placeholder="Enter Curators Name"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-violet-600 text-white text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-violet-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Update Nickname'}
              </button>
            </form>
          </section>

          {/* 비밀번호 수정 섹션 (로컬 전용) */}
          {!isOAuth2 && (
            <section className="p-8 rounded-[2.5rem] bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                  <FaLock size={14} />
                </div>
                <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">Password</h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-violet-600 text-white text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-violet-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Update Security Key'}
                </button>
              </form>
            </section>
          )}

          {/* 소셜 계정 안내 */}
          {isOAuth2 && (
            <div className="p-6 rounded-4xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/20 flex gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-violet-500 shrink-0">
                <FaTriangleExclamation size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-violet-600 tracking-widest">External Identity Protocol Active</p>
                <p className="text-xs text-violet-900/60 dark:text-violet-200/60">This account is managed through an external provider ({auth.provider?.toUpperCase()}). Security parameters must be adjusted through that service.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 탈퇴 버튼 섹션 */}
      <div className="pt-10 border-t border-neutral-100 dark:border-white/5 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.5em]">Emergency Extraction Protocol</p>
          <p className="text-xs text-neutral-500">Permanently terminate your curator session and remove all synced data from the neural grid.</p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="group flex items-center gap-4 px-8 py-4 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
        >
          <FaTrash size={14} className="group-hover:animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Withdraw Membership</span>
        </button>
      </div>
    </div>
  );
}