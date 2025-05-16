"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@mui/material";

const CameraButton: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // ตรวจสอบว่าเป็น Google Chrome แท้ๆ เท่านั้น
  const isChrome = () => {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor;

    console.log("User Agent:", userAgent);

    // ตรวจสอบ Chrome บน Desktop หรือ Android
    // ต้องมี "Chrome" ใน userAgent, vendor เป็น "Google Inc.", และ *ต้องไม่มี* "Edg/" (สำหรับ Edge) หรือ "OPR/" (สำหรับ Opera)
    const isDesktopOrAndroidChrome =
      userAgent.includes("Chrome") &&
      vendor === "Google Inc." &&
      !userAgent.includes("Edg/") &&
      !userAgent.includes("OPR/"); // เพิ่มการตรวจสอบ Opera เพื่อความแม่นยำ

    // ตรวจสอบ Chrome บน iOS
    // จะมี "CriOS/" (Chrome for iOS) ใน userAgent
    const isIOSChrome = userAgent.includes("CriOS/");

    // ถ้าเงื่อนไขใดเงื่อนไขหนึ่งเป็นจริง ให้ถือว่าเป็น Chrome ที่อนุญาต
    return isDesktopOrAndroidChrome || isIOSChrome;
  };

  // เปิดกล้อง
  const handleOpenCamera = async () => {
    if (!isChrome()) {
      alert("กรุณาใช้เบราว์เซอร์ Google Chrome เท่านั้นเพื่อเปิดกล้อง");
      return;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setPhoto(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้");
      setStream(null);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play video:", error);
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !stream) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL("image/png");
      setPhoto(imgData);
    }
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  return (
    <div>
      {!stream ? (
        <Button variant="contained" onClick={handleOpenCamera}>
          เปิดกล้อง
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
            }
            setStream(null);
            setPhoto(null);
          }}
        >
          ปิดกล้อง
        </Button>
      )}

      {stream && (
        <div style={{ marginTop: 16 }}>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: 400 }}
            autoPlay
            playsInline
            muted
          />
          <Button variant="contained" onClick={handleCapture} sx={{ mt: 2 }}>
            ถ่ายรูป
          </Button>
        </div>
      )}

      {photo && (
        <div style={{ marginTop: 16 }}>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "100%", maxWidth: 400 }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraButton;
