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

REM The commit message is written by Claude to ..\commit-message.txt (outside the site folder, so it is not published).
set "MSGFILE=%~dp0..\commit-message.txt"
if exist "%MSGFILE%" (
  git commit -F "%MSGFILE%"
  move /y "%MSGFILE%" "%~dp0..\commit-message.last.txt" >nul
) else (
  git commit -m "Site update"
)

echo.
echo === fetching latest changes from GitHub ===
git pull --rebase
if errorlevel 1 (
  echo.
  echo [ERROR] Could not merge the latest GitHub changes. Nothing was published.
  echo Please send a screenshot of this window to Claude.
  pause
  exit /b 1
)

echo.
echo === publishing ===
git push
if errorlevel 1 (
  echo.
  echo [ERROR] Publishing failed. Please send a screenshot of this window to Claude.
  pause
  exit /b 1
)

echo.
echo Done. It may take a few minutes to appear on GitHub Pages.
pause
