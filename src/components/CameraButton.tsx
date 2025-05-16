"use client";
import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { useCamera } from "@/hook/useCamera";

const CameraButton: React.FC = () => {
  const {
    videoRef,
    stream,
    photo,
    error,
    isBrowserSupported,
    openCamera,
    capturePhoto,
    closeCamera,
    clearError, // เพิ่ม clearError หากต้องการเรียกจาก component โดยตรง
  } = useCamera();

  useEffect(() => {
    if (error) {
      alert(error);
      // คุณอาจต้องการเรียก clearError() ที่นี่หลังจากแสดง alert
      // หรือปล่อยให้ hook จัดการการเคลียร์ error เองเมื่อมีการ action ใหม่
      // ตัวอย่าง: clearError(); // หากต้องการให้ alert แสดงครั้งเดียวต่อ error
    }
  }, [error, clearError]);

  const handleOpenCameraClick = () => {
    if (!isBrowserSupported()) {
      // Hook ก็มีการตรวจสอบนี้อยู่แล้ว แต่การตรวจสอบที่นี่จะให้ feedback ทันที
      alert("กรุณาใช้เบราว์เซอร์ Google Chrome เท่านั้นเพื่อเปิดกล้อง");
      return;
    }
    openCamera();
  };

  return (
    <div>
      {!stream ? (
        <Button variant="contained" onClick={handleOpenCameraClick}>
          เปิดกล้อง
        </Button>
      ) : (
        <Button variant="contained" onClick={closeCamera}>
          ปิดกล้อง
        </Button>
      )}

      {/* แสดงข้อความ error จาก hook หากต้องการ */}
      {/* {error && <p style={{ color: 'red', marginTop: '8px' }}>Error: {error}</p>} */}

      {stream && (
        <div style={{ marginTop: 16 }}>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: 400, border: "1px solid grey" }} // เพิ่ม border ให้เห็นกรอบวิดีโอ
            autoPlay
            playsInline
            muted
          />
          <Button
            variant="contained"
            onClick={capturePhoto}
            sx={{ mt: 2 }}
            disabled={!stream} // ปิดการใช้งานปุ่มหาก stream หายไป (เช่นหลังถ่ายรูป)
          >
            ถ่ายรูป
          </Button>
        </div>
      )}

      {photo && (
        <div style={{ marginTop: 16 }}>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "100%", maxWidth: 400, border: "1px solid grey" }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraButton;
