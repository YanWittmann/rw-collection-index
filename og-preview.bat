@echo off
REM Output: site\og-preview\index.html
setlocal

set DATASET=vanilla
set ENTRIES=CC:PearlReader, Watcher_vanillaEncounter_1:spinning-top, LP_0_PEB_GRAY_1:broadcast-pre-FP, LP_2_WHITE_3:broadcast-pre-FP, Watcher_Prince_Dialogue_Prince_1_2:rot-prince, DevComm_Shaded_Creatures_in_Struts:broadcast, DevComm_Ruin:broadcast, CC_GOLD:FP-artificer, Chatlog_CC0_LIGHT_BROWN:broadcast, LttM_SAINT_ANY_OTHER:LttM-saint, img4:PearlReader, AUDIO_JAM2:PearlReader, FP_Dialogue_rivulet_First_encounter:FP-4

rem set DATASET=modded
rem set ENTRIES=FR_Pearl_3:LttM, OA_centiporl:LttM, CC:chasing-wind, OE:chasing-wind

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
