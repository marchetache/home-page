@echo off
cd /d "%~dp0"

REM Clean up stray lock/tmp files left by a previous interrupted run, if any.
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\config.lock" del /f /q ".git\config.lock"
for /r ".git\objects" %%f in (tmp_obj_*) do del /f /q "%%f" 2>nul

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
