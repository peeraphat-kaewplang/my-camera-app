'use client';

import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  // ปรับแต่ง theme ตามต้องการ
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}