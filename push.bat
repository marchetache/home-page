@echo off
cd /d "%~dp0"
echo ===============================
echo  Site Update
echo ===============================
echo.
git add .
set "msg="
set /p msg=Enter commit message (or press Enter to skip):
if "%msg%"=="" set "msg=Site update"
git commit -m "%msg%"
git push
echo.
echo Done. It may take a few minutes to appear on GitHub Pages.
pause
