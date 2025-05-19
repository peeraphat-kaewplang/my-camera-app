"use client";

import { useState, useEffect, useCallback } from "react";

export interface PhotoDimensions {
  width: number;
  height: number;
}

export interface CameraHookResult {
  videoRefCallback: (node: HTMLVideoElement | null) => void;
  stream: MediaStream | null;
  photo: string | null; // Data URL
  photoDimensions: PhotoDimensions | null;
  error: string | null;
  isVideoReadyForCapture: boolean;
  isBrowserSupported: () => boolean;
  openCamera: () => Promise<void>;
  capturePhoto: () => void;
  closeCamera: () => void;
  clearError: () => void;
  getPhotoAsBase64Data: () => string | null;
}

export const useCamera = (): CameraHookResult => {
  const [actualVideoRef, setActualVideoRef] = useState<HTMLVideoElement | null>(
    null
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoDimensions, setPhotoDimensions] =
    useState<PhotoDimensions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReadyForCapture, setIsVideoReadyForCapture] =
    useState<boolean>(false);

  // Callback ref ที่จะส่งให้ <video> element
  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    // console.log("videoRefCallback called with node:", node);
    setActualVideoRef(node); // อัปเดต state ซึ่งจะ trigger useEffect ที่เกี่ยวข้อง
  }, []);

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
      // ไม่จำเป็นต้อง setStream(null) ที่นี่ เพราะการเรียก setStream ใหม่จะแทนที่ stream เก่า
      // และ useEffect cleanup ของ stream เก่า (ถ้ามี) จะทำงาน
    }

    setPhoto(null);
    setPhotoDimensions(null);
    setIsVideoReadyForCapture(false);

    let videoSetting: boolean | MediaTrackConstraints = true;
    if (typeof navigator !== "undefined") {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (isMobileDevice) {
        videoSetting = { facingMode: { ideal: "environment" } };
      }
      // สำหรับ Desktop, videoSetting จะยังเป็น true (ใช้ default ของ browser)
    }

    try {
      // console.log("Requesting camera with settings:", videoSetting);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoSetting,
      });

      setStream(mediaStream);
    } catch (err: unknown) {
      console.error("Error in openCamera -> getUserMedia:", err);
      let errorMessage = "ไม่สามารถเข้าถึงกล้องได้ หรือกล้องที่ต้องการไม่พร้อมใช้งาน";

      if (err instanceof Error) { // ตรวจสอบว่าเป็น instance ของ Error
        console.error("Error details:", err.name, err.message);
        // errorMessage = `ไม่สามารถเข้าถึงกล้อง: ${err.name} - ${err.message}`; // ใช้ข้อความที่เจาะจงมากขึ้นด้านล่าง
        if(err.name === "NotAllowedError"){ // Permission denied
          errorMessage = "กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ของคุณ";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError"){ // No camera found
          errorMessage = "ไม่พบกล้องที่พร้อมใช้งาน";
        } else if (err.name === "AbortError") { // User or system aborted
          errorMessage = "การเข้าถึงกล้องถูกยกเลิก";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") { // Hardware error
            errorMessage = "กล้องอาจจะกำลังถูกใช้งานโดยโปรแกรมอื่น หรือมีปัญหาทาง Hardware";
        } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") { // Constraints issue
            errorMessage = "ไม่สามารถตั้งค่ากล้องตามที่ร้องขอได้ (เช่น facingMode ไม่ถูกต้อง หรือความละเอียดไม่รองรับ)";
        } else {
            errorMessage = `เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการเข้าถึงกล้อง: ${err.message}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      setStream(null);
    }
  }, [stream, isBrowserSupported, clearError]);

  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("useEffect (stream/actualVideoRef): Exiting - no window");
      return;
    }

    // actualVideoRef คือ DOM element ที่ได้จาก callback ref
    const currentVideoElement = actualVideoRef;
    const currentStream = stream;

    // console.log("useEffect (stream/actualVideoRef): Running. Stream ID:", currentStream ? currentStream.id : 'null', "Video Element:", currentVideoElement);

    if (!currentVideoElement) return;

    const handleLoadedMetadata = () => {
      if (
        currentVideoElement &&
        currentVideoElement.videoWidth > 0 &&
        currentVideoElement.videoHeight > 0
      ) {
        // console.log(`useEffect: Video metadata loaded. Dimensions: ${currentVideoElement.videoWidth}x${currentVideoElement.videoHeight}`);
        setIsVideoReadyForCapture(true);
      } else {
        // console.warn('useEffect: onloadedmetadata fired but video dimensions are still 0 or video element is null. Video:', currentVideoElement);
        setIsVideoReadyForCapture(false);
      }
    };

    const handleCanPlay = () => {
      // console.log("useEffect: Video event 'canplay' fired.");
      if (currentVideoElement && currentVideoElement.paused) {
        // เล่นอีกครั้งถ้ายัง paused อยู่
        currentVideoElement
          .play()
          .catch((e) =>
            console.error("Error playing in oncanplay:", e.name, e.message)
          );
      }
    };

    const handleVideoError = () => {
      // console.error('Video Element Error:', e, currentVideoElement.error);
      setError(
        `เกิดข้อผิดพลาดกับ Video Element: ${
          currentVideoElement.error?.message || "Unknown error"
        }`
      );
      setIsVideoReadyForCapture(false);
    };

    if (currentStream && currentVideoElement) {
      // console.log("useEffect: Assigning stream to video element. Stream ID:", currentStream.id);
      currentVideoElement.srcObject = currentStream;
      setIsVideoReadyForCapture(false); // Reset ก่อนรอ loadedmetadata

      currentVideoElement.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
      currentVideoElement.addEventListener("canplay", handleCanPlay);
      currentVideoElement.addEventListener("error", handleVideoError);

      // console.log("useEffect: Attempting to play video. Muted:", currentVideoElement.muted, "Paused (before play):", currentVideoElement.paused);
      currentVideoElement.play().catch((playError) => {
        // console.error(
        //   "useEffect: Error attempting to play video:",
        //   playError.name,
        //   playError.message
        // );
        setError(`มีปัญหาในการเริ่มเล่นวิดีโอ: ${playError.message}`);
        setIsVideoReadyForCapture(false);
      });
    } else if (currentVideoElement) {
      // console.log(
      //   "useEffect: Stream is null, clearing srcObject on existing video element."
      // );
      currentVideoElement.srcObject = null;
      setIsVideoReadyForCapture(false);
    }

    return () => {
      if (currentVideoElement) {
        currentVideoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        currentVideoElement.removeEventListener("canplay", handleCanPlay);
        currentVideoElement.removeEventListener("error", handleVideoError);
        if (currentVideoElement.srcObject) {
          // console.log("Cleanup: Clearing srcObject");
          currentVideoElement.srcObject = null;
        }
      }
      // การ stop tracks ของ stream จะถูกจัดการโดย closeCamera หรือเมื่อ openCamera เรียก stream ใหม่
      // จึงไม่จำเป็นต้อง stop tracks ที่นี่โดยตรง เพราะอาจจะทำให้ stream หยุดก่อนเวลา
    };
  }, [stream, actualVideoRef]); // Effect นี้จะทำงานเมื่อ stream หรือ actualVideoRef (DOM element) เปลี่ยน

  const capturePhoto = useCallback(() => {
    clearError();
    if (
      !isVideoReadyForCapture ||
      !actualVideoRef ||
      !actualVideoRef.videoWidth ||
      !actualVideoRef.videoHeight
    ) {
      setError(
        "กล้องยังไม่พร้อมใช้งาน (metadata) หรือวิดีโอไม่มีขนาดที่ถูกต้องสำหรับการถ่ายภาพ"
      );
      setPhotoDimensions(null);
      return;
    }

    const canvas = document.createElement("canvas");
    const currentVideoWidth = actualVideoRef.videoWidth;
    const currentVideoHeight = actualVideoRef.videoHeight;

    canvas.width = currentVideoWidth;
    canvas.height = currentVideoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Optional: Mirroring for front camera
      // const videoTrackSettings = stream?.getVideoTracks()[0]?.getSettings();
      // if (videoTrackSettings?.facingMode === 'user') {
      //   ctx.scale(-1, 1);
      //   ctx.translate(-canvas.width, 0);
      // }
      ctx.drawImage(actualVideoRef, 0, 0, canvas.width, canvas.height);
      const imgDataUrl = canvas.toDataURL("image/png");
      setPhoto(imgDataUrl);
      setPhotoDimensions({
        width: currentVideoWidth,
        height: currentVideoHeight,
      });
    } else {
      setError("ไม่สามารถสร้าง Canvas Context สำหรับถ่ายภาพได้");
      setPhotoDimensions(null);
    }

    // ปิด stream หลังจากถ่ายรูป
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null); // จะ trigger useEffect cleanup และ reset isVideoReadyForCapture
    // setIsVideoReadyForCapture(false); // ถูกจัดการโดย useEffect จากการที่ stream เป็น null
  }, [stream, actualVideoRef, clearError, isVideoReadyForCapture]);

  const closeCamera = useCallback(() => {
    clearError();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null); // การตั้ง stream เป็น null จะ trigger useEffect cleanup
    setPhoto(null);
    setPhotoDimensions(null);
    setIsVideoReadyForCapture(false); // Reset โดยตรงด้วย
  }, [stream, clearError]);

  const getPhotoAsBase64Data = useCallback((): string | null => {
    if (photo && photo.includes(",")) {
      return photo.split(",")[1] || null;
    }
    return null;
  }, [photo]);

  return {
    videoRefCallback,
    stream,
    photo,
    photoDimensions,
    error,
    isVideoReadyForCapture,
    isBrowserSupported,
    openCamera,
    capturePhoto,
    closeCamera,
    clearError,
    getPhotoAsBase64Data,
  };
};
