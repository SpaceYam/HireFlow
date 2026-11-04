실행 방법

1. 개발 단계 실행

bash
pip install -r requirements.txt
python main.py

2. Windows EXE 빌드

build.bat 더블클릭

3. 최종 실행

text
dist/
└── HIREFLOW/
    ├── HIREFLOW.exe
    └── _internal/

* 데이터 저장 위치
(HIREFLOW 영구 저장소)

text
%LOCALAPPDATA%\HIREFLOW\
├── web-storage/
└── cache/


* 꼭 수정할 부분 2가지 (반영 완료)
① LocalStorage 데이터 유지
main.py에서 브라우저 프로필을 설정하는 코드는 QWebEngineView를 생성하기 전에 실행해야 해.

python
profile = QWebEngineProfile.defaultProfile()

storage = user_data_path()

profile.setPersistentStoragePath(
    str(storage / "web-storage")
)

profile.setCachePath(
    str(storage / "cache")
)

self.browser = QWebEngineView(self)
이렇게 하면 앱을 종료하고 다시 실행해도 지원자, 메모, 일정 등의 브라우저 저장 데이터가 유지돼.

데이터는 다음 위치에 저장돼.

text
%LOCALAPPDATA%\HIREFLOW\

② 포트 번호 유지

python
PORT = 8765


* 빌드가 정상적으로 완료되지 않았을 가능성이 있어. 같이 확인해 보자.

1. 먼저 프로젝트 폴더 확인
build.bat이 있는 폴더에서 CMD를 열고 아래 명령어를 실행해.

cmd
dir
그다음 직접 빌드해 봐.

cmd
.venv\Scripts\activate
pyinstaller --version
정상적으로 설치되어 있다면 버전이 표시돼.

2. 다시 빌드하기

cmd
pyinstaller --noconfirm --clean --windowed --onefile --name HIREFLOW --collect-all PySide6 --add-data "index.html;." --add-data "css;css" --add-data "js;js" --add-data "assets;assets" main.py
빌드가 성공하면 다음 위치에 생성돼.

text
프로젝트폴더/
└── dist/
    └── HIREFLOW.exe