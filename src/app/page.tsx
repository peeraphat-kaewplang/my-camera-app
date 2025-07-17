"use client";
import CameraButton from "@/components/CameraButton";
import { useEffect } from "react";

async function callApi(data: Record<string, unknown>) {
  await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export default function Page() {
  useEffect(() => {
    callApi({ userId: "test-user" });
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>ทดสอบถ่ายภาพจากกล้อง</h1>
      <CameraButton />
    </main>
  );
}