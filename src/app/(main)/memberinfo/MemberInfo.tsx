'use client';

import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authUserAtom } from '@/jotai/loginjotai';
import { updateMemberInfoAPI, deleteMemberAPI, updateProfileImg, getUserInfoAPI } from '@/app/api/memberservice/memberapi';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaTrash, FaCamera, FaCircleCheck, FaTriangleExclamation, FaXmark } from 'react-icons/fa6';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // OAuth2 계정 여부 판단
  const isOAuth2 = auth?.provider && auth.provider !== 'local';



  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  // auth 데이터가 로드되면 로컬 상태 변수들에 동기화
  useEffect(() => {
    if (auth) {
      setNickname(auth.name || '');
      setProfileImage(auth.profile || '');
    }
  }, [auth]);

  useEffect(() => {
    if (isMounted) {
      const stored = localStorage.getItem('auth_info');
      const isActuallyLoggedOut = !auth && (!stored || stored === 'null');

      if (isActuallyLoggedOut) {
        router.push('/login');
      }
    }
  }, [isMounted, auth, router]);

  /**
   * file input 변경 시 호출되는 핸들러
   * 선택된 파일을 state에 저장하고, 미리보기 URL을 생성하여 화면에 표시합니다.
   * @param e - 파일 입력 이벤트 객체
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 프로필 이미지를 서버에 업데이트하는 비동기 함수
   * 선택된 파일이 없거나 인증 정보가 없으면 중단합니다.
   * 업로드 성공 시 전역 상태(auth)를 갱신하고 성공 메시지를 표시합니다.
   */
  const handleUpdateImage = async () => {
    if (!auth || !selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateProfileImg(auth.accessToken, auth.userId, selectedFile);

      if (result) {
        setAuth(prev => prev ? { ...prev, profile: profileImage } : null);
        setSelectedFile(null);
        setMessage({ type: 'success', text: 'Profile image updated.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update image' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 회원 정보를 수정(닉네임, 비밀번호)하는 비동기 함수
   * 비밀번호 변경은 로컬 계정인 경우에만 유효성 검사를 수행합니다.
   * @param e - 폼 제출 이벤트 객체
   */
  const handleUpdateMemberInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    // 전송할 데이터 객체 생성
    const updateData: { nickname?: string; password?: string } = {
      nickname: nickname
    };

    // 비밀번호 변경 시도 시 검증 (로컬 계정 전용)
    if (!isOAuth2 && newPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords confirmation do not match.' });
        return;
      }
      updateData.password = newPassword;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateMemberInfoAPI(auth.accessToken, updateData);

      if (result) {
        setAuth({ ...auth, name: nickname });
        setMessage({ type: 'success', text: 'Member information updated successfully.' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Failed to update member information.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [withdrawId, setWithdrawId] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');

  /**
   * 회원 탈퇴 모달을 여는 핸들러
   * 실제 탈퇴 로직은 모달 내부 폼에서 처리됩니다.
   */
  const handleDeleteAccount = async () => {
    if (!auth) return;
    setIsDeleteModalOpen(true);
  };

  /**
   * 실제 회원 탈퇴 요청을 서버로 전송하는 비동기 함수
   * ID와 비밀번호를 검증하고, 성공 시 로그아웃 처리 및 로그인 페이지로 이동합니다.
   * @param e - 폼 제출 이벤트 객체
   */
  const submitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    try {
      setIsSubmitting(true);
      const result = await deleteMemberAPI(auth.accessToken, withdrawId, withdrawPassword);
      if (result) {
        setAuth(null);
        setIsDeleteModalOpen(false)
        router.push('/login');
      } else {
        alert('Withdrawal failed. Please check your credentials.');
      }
    } catch (error) {
      alert('Error occurred during withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || !auth) return null;

  const isImageChanged = profileImage !== auth.profile;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-6">
      {/* 상단 헤더 섹션 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-normal italic text-neutral-900 dark:text-white">회원 정보</h1>
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
              {(() => {
                const isValid = typeof profileImage === 'string' && (profileImage.startsWith('http') || profileImage.startsWith('data:'));
                return isValid ? (
                  /* src 뒤에 항상 타임스탬프를 붙여 캐시 방지 (단, data: 미리보기는 제외) */
                  <Image
                    src={
                      profileImage.startsWith('data:')
                        ? profileImage
                        : (profileImage.includes('?') ? `${profileImage}&t=${Date.now()}` : `${profileImage}?t=${Date.now()}`)
                    }
                    alt="Profile"
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <FaUser size={60} />
                  </div>
                );
              })()}
              {/* input을 감싸는 label로 변경: 클릭 안정성 확보 */}
              <label className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                <FaCamera size={30} className="text-white mb-2" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Update Visual</span>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
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



          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-white/5 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">인증 방식</label>
              <p className="text-xs font-black text-violet-600 uppercase tracking-wider">{auth.provider || 'LOCAL'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">아이디</label>
              <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{auth.userId}</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 정보 수정 폼 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 닉네임 수정 섹션 */}
          <section className="p-8 rounded-[2.5rem] bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-white/5">
            <form onSubmit={handleUpdateMemberInfo} className="space-y-12">
              {/* 1. Identity Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                    <FaUser size={14} />
                  </div>
                  <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">닉네임</h2>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                    placeholder="Enter Curator Handle"
                  />
                </div>
              </div>

              {/* 2. Security Section (Local only) */}
              {!isOAuth2 && (
                <div className="space-y-8 pt-8 border-t border-neutral-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
                      <FaLock size={14} />
                    </div>
                    <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">비밀번호</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">새 비밀번호</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">비밀번호 확인</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-violet-500 transition-all text-sm tracking-widest font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button: 하단 고정 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-3xl bg-neutral-900 dark:bg-violet-600 text-white text-[20px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-violet-600 dark:hover:bg-violet-500 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {isSubmitting ? '수정 중...' : '회원 정보 수정'}
              </button>
            </form>
          </section>



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
      <div className="max-w-2xl mx-auto p-4 px-6 rounded-2xl bg-red-50/30 dark:bg-red-950/5 border-2 border-red-200/50 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">회원 탈퇴</p>
          <p className="text-xs text-neutral-500">회원 탈퇴 시 모든 데이터가 삭제됩니다.</p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shrink-0 shadow-lg shadow-red-500/10"
        >
          <FaTrash size={12} />
          회원 탈퇴
        </button>
      </div>

      {/* 회원 탈퇴 모달 (Withdrawal Modal) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl border border-neutral-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                    <FaTrash size={14} />
                  </div>
                  <h2 className="text-xl font-normal italic text-neutral-900 dark:text-white">회원 탈퇴 확인</h2>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <FaXmark size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">회원 탈퇴 확인</p>
                <p className="text-xs text-neutral-500">회원 탈퇴 시 모든 데이터가 삭제됩니다.</p>
              </div>

              <form onSubmit={submitWithdraw} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest ml-1">ID</label>
                  <input
                    type="text"
                    value={withdrawId}
                    onChange={(e) => setWithdrawId(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-red-500 transition-all text-sm font-bold tracking-widest"
                    placeholder="Enter ID"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest ml-1">비밀번호</label>
                  <input
                    type="password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 outline-none focus:border-red-500 transition-all text-sm font-bold tracking-widest"
                    placeholder="Enter Password"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? '탈퇴 중...' : '회원 탈퇴'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}