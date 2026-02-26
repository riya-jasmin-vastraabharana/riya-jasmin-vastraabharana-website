@echo off
:: ============================================================
::  Run this from inside:
::  C:\Riya Jasmin Vastraabharana\riya-jasmin-vastraabharana\
:: ============================================================
echo.
echo  Running file writer...
echo  (This uses PowerShell bypass - no admin needed)
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0write-src-files.ps1"
echo.
pause
