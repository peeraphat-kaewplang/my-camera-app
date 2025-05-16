'use client'; // Hooks ที่มีการใช้ state, effect, หรือ browser APIs ต้องระบุว่าเป็น client-side

import { useRef, useState, useEffect, useCallback } from 'react';

export interface CameraHookResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  photo: string | null;
  error: string | null;
  isBrowserSupported: () => boolean;
  openCamera: () => Promise<void>;
  capturePhoto: () => void;
  closeCamera: () => void;
  clearError: () => void;
}

export const useCamera = (): CameraHookResult => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isBrowserSupported = useCallback(() => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor;

    const isDesktopOrAndroidChrome =
      userAgent.includes("Chrome") &&
      vendor === "Google Inc." &&
      !userAgent.includes("Edg/") &&
      !userAgent.includes("OPR/");
    const isIOSChrome = userAgent.includes("CriOS/");

    return isDesktopOrAndroidChrome || isIOSChrome;
  }, []);

  const openCamera = useCallback(async () => {
    clearError(); // เคลียร์ error เก่าก่อน
    if (!isBrowserSupported()) {
      setError('กรุณาใช้เบราว์เซอร์ Google Chrome เท่านั้นเพื่อเปิดกล้อง');
      return;
    }

    if (stream) { // หากมี stream เก่า ให้ปิดก่อน
      stream.getTracks().forEach(track => track.stop());
    }

    const videoConstraints: MediaTrackConstraints = {};
    if (typeof navigator !== 'undefined') {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileDevice) {
        videoConstraints.facingMode = { ideal: "environment" };
      } else {
        videoConstraints.facingMode = { ideal: "user" };
      }
    } else {
      videoConstraints.facingMode = { ideal: "user" }; // Fallback
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      });
      setStream(mediaStream);
      setPhoto(null); // ล้างรูปภาพเก่า
    } catch (err) {
      console.error("Error accessing camera with constraints:", err);
      setError('ไม่สามารถเข้าถึงกล้องได้ หรือกล้องที่ต้องการไม่พร้อมใช้งาน');
      setStream(null);
    }
  }, [stream, isBrowserSupported, clearError]);

  useEffect(() => {
    if (typeof window === 'undefined' || !videoRef.current) return;

    let currentStream = stream; // Capture stream for cleanup and usage in effect

    if (currentStream && videoRef.current) {
      videoRef.current.srcObject = currentStream;
      videoRef.current.play().catch(playError => {
        console.error("Error attempting to play video:", playError);
        setError('มีปัญหาในการเล่นวิดีโอจากกล้อง');
      });
    } else if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear srcObject if stream is null
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); // Re-run effect if stream object changes

  const capturePhoto = useCallback(() => {
    clearError();
    if (!videoRef.current || !stream || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setError("กล้องยังไม่พร้อมใช้งาน หรือวิดีโอไม่มีขนาดที่ถูกต้องสำหรับการถ่ายภาพ");
      return;
    }
    
    const canvas = document.createElement('canvas');
    // ตั้งค่าขนาด canvas ให้ตรงกับขนาดจริงของวิดีโอที่แสดงผล
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');
      setPhoto(imgData);
    } else {
      setError("ไม่สามารถสร้าง Canvas Context สำหรับถ่ายภาพได้");
    }

    // ปิด stream หลังจากถ่ายภาพ
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  }, [stream, videoRef, clearError]);

  const closeCamera = useCallback(() => {
    clearError();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setPhoto(null);
  }, [stream, clearError]);

  return {
    videoRef,
    stream,
    photo,
    error,
    isBrowserSupported,
    openCamera,
    capturePhoto,
    closeCamera,
    clearError,
  };
};