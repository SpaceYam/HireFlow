
@echo off
chcp 65001 > nul
title HIREFLOW PORTABLE BUILD

cd /d "%~dp0"

echo ================================
echo     HIREFLOW PORTABLE BUILD
echo ================================

if not exist ".venv" (
    py -m venv .venv
)

call .venv\Scripts\activate.bat

echo [1/3] Installing packages...

python -m pip install --upgrade pip
pip install -r requirements.txt

echo [2/3] Building portable EXE...

pyinstaller ^
 --noconfirm ^
 --clean ^
 --windowed ^
 --onefile ^
 --name HIREFLOW ^
 --collect-all PySide6 ^
 --add-data "index.html;." ^
 --add-data "css;css" ^
 --add-data "js;js" ^
 --add-data "assets;assets" ^
 --icon "assets/icon.ico" ^
 main.py

echo [3/3] BUILD COMPLETE

echo.
echo EXE LOCATION:
echo dist\HIREFLOW.exe

echo.
pause
