@echo off
chcp 65001 >nul
echo ========================================================
echo   EarBalancer EQ - Standalone Desktop Launcher
echo ========================================================
echo.
echo [1/2] 개발 및 로컬 서버를 준비 중입니다...

:: Start Vite dev server in background if not already started
start /B "" npm run dev -- --host 127.0.0.1 --port 3000 >nul 2>&1

:: Wait 1.5 seconds for Vite server to spin up
timeout /t 2 /nobreak >nul

echo [2/2] 스탠드얼론 데스크톱 창을 실행합니다...
:: Launch Microsoft Edge or Google Chrome in dedicated App Mode (주소창/탭 없는 단독 창)
start "" msedge.exe --app="http://localhost:3000" || start "" chrome.exe --app="http://localhost:3000" || start "" "http://localhost:3000"

echo.
echo EarBalancer EQ가 독립 데스크톱 창으로 실행되었습니다.
