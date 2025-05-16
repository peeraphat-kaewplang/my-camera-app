'use client';
import React, { useRef, useState, useEffect } from 'react';
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

    // หากมี stream เก่าอยู่ ให้ปิดก่อน
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream); // ตั้งค่า stream ใหม่, useEffect จะจัดการการเล่นวิดีโอ
      setPhoto(null); // ล้างรูปภาพเก่า (ถ้ามี)
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert('ไม่สามารถเข้าถึงกล้องได้');
      setStream(null); // ตรวจสอบให้แน่ใจว่า stream เป็น null หากเกิดข้อผิดพลาด
    }
  };

  // Effect สำหรับจัดการการเล่นวิดีโอเมื่อ stream พร้อมใช้งาน
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(error => {
        console.error("Error attempting to play video:", error);
        // อาจจะแสดง alert หรือข้อความแจ้งผู้ใช้หากการเล่นวิดีโอล้มเหลว
        // alert('ไม่สามารถเล่นวิดีโอได้');
      });
    }

    // Cleanup function: จะทำงานเมื่อ component unmount หรือ stream เปลี่ยนไป
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); // ให้ useEffect ทำงานใหม่ทุกครั้งที่ stream เปลี่ยน

  // ถ่ายรูป (จับภาพจาก video)
  const handleCapture = () => {
    if (!videoRef.current || !stream) return; // ตรวจสอบว่ามี videoRef และ stream
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png');
      setPhoto(imgData);
    }
    // ปิดกล้องหลังจากถ่ายรูป
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  return (
    <div>
      {!stream ? (
        <Button variant="contained" onClick={handleOpenCamera}>
          เปิดกล้อง
        </Button>
      ) : (
        <Button variant="contained" onClick={() => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setStream(null);
          setPhoto(null);
        }}>
          ปิดกล้อง
        </Button>
      )}

      {stream && (
        <div style={{ marginTop: 16 }}>
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: 400 }}
            autoPlay // เพิ่ม autoPlay
            playsInline //สำคัญสำหรับ iOS และช่วยให้เล่นได้ในหลาย browser
            muted // การปิดเสียงวิดีโอของตัวเองมักจำเป็นสำหรับการ autoplay ในบางเบราว์เซอร์
          />
          <Button
            variant="contained"
            onClick={handleCapture}
            sx={{ mt: 2 }}
          >
            ถ่ายรูป
          </Button>
        </div>
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