"use client";
import React, { useEffect } from "react";
import { Button, Dialog, IconButton, useMediaQuery, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles"; // Import useTheme
import Image from "next/image";
import { useCamera } from "@/hook/useCamera";

// Import Icons
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";

const CameraButton: React.FC = () => {
  const {
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
  } = useCamera();

  const theme = useTheme();
  // กำหนดให้เป็น mobile ถ้าหน้าจอเล็กกว่า sm (600px) หรือปรับ breakpoint ตามต้องการ
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (error) {
      alert(error);
      // clearError(); // คุณอาจต้องการเคลียร์ error หลังจากแสดง alert
    }
  }, [error, clearError]);

  const handleOpenCameraClick = () => {
    if (!isBrowserSupported()) {
      alert("กรุณาใช้เบราว์เซอร์ Google Chrome เท่านั้นเพื่อเปิดกล้อง");
      return;
    }
    openCamera();
  };

  // สไตล์สำหรับวิดีโอเต็มจอ
  const videoStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover", // ให้วิดีโอเต็มพื้นที่ อาจมีการ crop บ้างเพื่อรักษาสัดส่วน
    backgroundColor: "black", // พื้นหลังสีดำเผื่อวิดีโอยังไม่โหลด
  };

  return (
    <div>
      {!stream && ( // แสดงปุ่ม "เปิดกล้อง" เมื่อยังไม่มี stream (กล้องยังไม่เปิด)
        <Button variant="contained" onClick={handleOpenCameraClick}>
          เปิดกล้อง
        </Button>
      )}

      <Dialog
        open={!!stream} // เปิด Dialog เมื่อมี stream (กล้องเปิดอยู่)
        onClose={closeCamera} // เมื่อปิด Dialog (เช่น กด ESC หรือคลิกนอก Dialog) ให้เรียก closeCamera
        fullScreen={isMobile} // เต็มจอเมื่อเป็น mobile
        PaperProps={{
          sx: {
            backgroundColor: "black", // พื้นหลังของ Dialog
            ...(isMobile
              ? { margin: 0, borderRadius: 0, width: "100%", height: "100%" }
              : {
                  width: "90%",
                  maxWidth: "700px",
                  height: "85vh",
                  borderRadius: "8px",
                }), // ขนาดสำหรับ Desktop
          },
        }}
      >
        {/* Container หลักสำหรับวิดีโอและปุ่มควบคุม */}
        {stream && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRefCallback}
              style={videoStyle}
              autoPlay
              playsInline
              muted
            />

            {/* ปุ่มปิด (X) ที่มุมซ้ายบน */}
            <IconButton
              aria-label="close camera"
              onClick={closeCamera}
              sx={{
                position: "absolute",
                top: isMobile ? 16 : 8,
                left: isMobile ? 16 : 8,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                },
                zIndex: 10, // ให้อยู่เหนือวิดีโอ
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* ปุ่มถ่ายรูป (Shutter button) */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: isMobile ? "24px" : "16px",
                zIndex: 10,
              }}
            >
              <IconButton
                aria-label="capture photo"
                onClick={capturePhoto}
                disabled={!stream || !isVideoReadyForCapture}
                sx={{
                  width: isMobile ? 72 : 64,
                  height: isMobile ? 72 : 64,
                  backgroundColor: "white",
                  border: "4px solid rgba(0,0,0,0.2)",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  "&:active": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <CameraAltIcon
                  sx={{ fontSize: isMobile ? 36 : 30, color: "black" }}
                />
              </IconButton>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* แสดงรูปที่ถ่ายได้ */}
      {photo && photoDimensions && (
        <div style={{ marginTop: 16, maxWidth: "400px", width: "100%" }}>
          <Image
            src={photo}
            alt="Captured"
            width={photoDimensions.width}
            height={photoDimensions.height}
            style={{
              width: "100%",
              height: "auto",
              border: "1px solid grey",
              borderRadius: "4px", // เพิ่มความโค้งมนให้รูปภาพ
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraButton;
