@echo off
echo Starting Audio Stream App (Vercel Compatible)...
echo.

echo Installing dependencies...
npm install

echo.
echo Starting the development server...
echo The app will be available at: http://localhost:3000
echo Socket.io will be available via API routes
echo.

npm run dev
