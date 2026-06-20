@echo off
REM Output: site\og-preview\index.html
setlocal
set DATASET=vanilla
set ENTRIES=CC, CC:PearlReader, TEXT_AUDIO_TALKSHOW, LttM_SAINT_ANY_OTHER, Chatlog_CC0, Iterator_Dialogue_Items_Karma_Flower:LttM, img4:PearlReader, AUDIO_JAM2:PearlReader
REM Leave DESIGNS blank for every registered design, or list a few to compare (e.g. codex, feature, plate).
set DESIGNS=reader

cd /d "%~dp0site"
call npx tsx build-scripts/build.ts og --dataset %DATASET% --out ./og-preview --no-cache --entries "%ENTRIES%" --designs "%DESIGNS%"
if errorlevel 1 (
    echo.
    echo Render failed.
    pause
    exit /b 1
)
start "" "og-preview\index.html"
endlocal
