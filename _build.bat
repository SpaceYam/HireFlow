
@echo off
chcp 65001 > nul

title HIREFLOW BUILD

echo =====================================
echo       HIREFLOW EXE BUILD
echo =====================================

cd /d "%~dp0"

echo.
echo [1/4] Python 가상환경 생성

if not exist ".venv" (
    py -m venv .venv
)

call .venv\Scripts\activate.bat

echo.
echo [2/4] 패키지 설치

python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [3/4] EXE 빌드

pyinstaller ^
 --noconfirm ^
 --clean ^
 --windowed ^
 --onedir ^
 --name HIREFLOW ^
 --collect-all PySide6 ^
 --add-data "index.html;." ^
 --add-data "css;css" ^
 --add-data "js;js" ^
 --add-data "assets;assets" ^
 main.py

echo.
echo [4/4] 빌드 완료

echo.
echo 실행 파일 위치:
echo dist\HIREFLOW\HIREFLOW.exe

echo.
pause
