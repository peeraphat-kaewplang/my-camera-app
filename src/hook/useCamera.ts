"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export interface PhotoDimensions {
  width: number;
  height: number;
}

export interface CameraHookResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  photo: string | null; // Data URL
  photoDimensions: PhotoDimensions | null; // ขนาดของรูปภาพ
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
  const [photoDimensions, setPhotoDimensions] =
    useState<PhotoDimensions | null>(null); // State ใหม่สำหรับเก็บขนาดรูป
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isBrowserSupported = useCallback(() => {
    if (typeof navigator === "undefined") return false;
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
    clearError();
    if (!isBrowserSupported()) {
      setError("กรุณาใช้เบราว์เซอร์ Google Chrome เท่านั้นเพื่อเปิดกล้อง");
      return;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // เคลียร์รูปภาพและขนาดเก่าเมื่อเปิดกล้องใหม่
    setPhoto(null);
    setPhotoDimensions(null);

    const videoConstraints: MediaTrackConstraints = {};
    if (typeof navigator !== "undefined") {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (isMobileDevice) {
        videoConstraints.facingMode = { ideal: "environment" };
      } else {
        videoConstraints.facingMode = { ideal: "user" };
      }
    } else {
      videoConstraints.facingMode = { ideal: "user" };
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera with constraints:", err);
      setError("ไม่สามารถเข้าถึงกล้องได้ หรือกล้องที่ต้องการไม่พร้อมใช้งาน");
      setStream(null);
    }
  }, [stream, isBrowserSupported, clearError]);

  useEffect(() => {
    if (typeof window === "undefined" || !videoRef.current) return;
    const currentStream = stream;
    if (currentStream && videoRef.current) {
      videoRef.current.srcObject = currentStream;
      videoRef.current.play().catch((playError) => {
        console.error("Error attempting to play video:", playError);
        setError("มีปัญหาในการเล่นวิดีโอจากกล้อง");
      });
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = useCallback(() => {
    clearError();
    if (
      !videoRef.current ||
      !stream ||
      !videoRef.current.videoWidth ||
      !videoRef.current.videoHeight
    ) {
      setError(
        "กล้องยังไม่พร้อมใช้งาน หรือวิดีโอไม่มีขนาดที่ถูกต้องสำหรับการถ่ายภาพ"
      );
      setPhotoDimensions(null); // เคลียร์ขนาดรูปถ้ามีปัญหา
      return;
    }

    const canvas = document.createElement("canvas");
    const currentVideoWidth = videoRef.current.videoWidth;
    const currentVideoHeight = videoRef.current.videoHeight;

    canvas.width = currentVideoWidth;
    canvas.height = currentVideoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgDataUrl = canvas.toDataURL("image/png");
      setPhoto(imgDataUrl);
      setPhotoDimensions({
        width: currentVideoWidth,
        height: currentVideoHeight,
      }); // เก็บขนาดของรูปภาพ
    } else {
      setError("ไม่สามารถสร้าง Canvas Context สำหรับถ่ายภาพได้");
      setPhotoDimensions(null);
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  }, [stream, videoRef, clearError]);

  const closeCamera = useCallback(() => {
    clearError();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setPhoto(null);
    setPhotoDimensions(null); // เคลียร์ขนาดรูปเมื่อปิดกล้อง
  }, [stream, clearError]);

  return {
    videoRef,
    stream,
    photo,
    photoDimensions, // ส่ง photoDimensions ออกไป
    error,
    isBrowserSupported,
    openCamera,
    capturePhoto,
    closeCamera,
    clearError,
  };
};
