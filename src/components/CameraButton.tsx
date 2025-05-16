'use client';
import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';

const CameraButton: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // ตรวจสอบให้ใช้ได้เฉพาะเบราว์เซอร์ Chrome
  const isChrome = () => {
    const ua = navigator.userAgent;
    return /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
  };

  // เปิดกล้อง
  const handleOpenCamera = async () => {
    if (!isChrome()) {
      alert('กรุณาใช้เบราว์เซอร์ Chrome เพื่อเปิดกล้อง');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเข้าถึงกล้องได้');
    }
  };

  // ถ่ายรูป (จับภาพจาก video)
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imgData = canvas.toDataURL('image/png');
      setPhoto(imgData);
    }
    // ปิดกล้อง
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenCamera}>
        เปิดกล้อง
      </Button>

      {stream && (
        <>
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: 400, marginTop: 16 }}
          />
          <Button
            variant="contained"
            onClick={handleCapture}
            sx={{ mt: 2 }}
          >
            ถ่ายรูป
          </Button>
        </>
      )}

      {photo && (
        <div style={{ marginTop: 16 }}>
          <img src={photo} alt="Captured" style={{ width: '100%', maxWidth: 400 }} />
        </div>
      )}
    </div>
  );
};

export default CameraButton;