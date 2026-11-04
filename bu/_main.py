
import sys
import os
import threading
import mimetypes
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from PySide6.QtCore import QUrl
from PySide6.QtGui import QIcon, QDesktopServices
from PySide6.QtWidgets import QApplication, QMainWindow, QMessageBox
from PySide6.QtWebEngineCore import (
    QWebEngineProfile,
    QWebEngineSettings
)
from PySide6.QtWebEngineWidgets import QWebEngineView


APP_NAME = "HIREFLOW"
HOST = "127.0.0.1"
PORT = 8765


def resource_path(relative_path):
    """개발 환경과 PyInstaller 환경 모두 지원"""
    if getattr(sys, "frozen", False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).resolve().parent

    return base_path / relative_path


def user_data_path():
    """사용자 데이터는 실행 파일 외부에 영구 저장"""
    if sys.platform == "win32":
        base = Path(os.environ.get("LOCALAPPDATA", Path.home()))
    else:
        base = Path.home() / ".local" / "share"

    path = base / APP_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path


class LocalHandler(SimpleHTTPRequestHandler):

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(
            *args,
            directory=str(directory),
            **kwargs
        )

    def log_message(self, format, *args):
        # 콘솔 로그 최소화
        pass


class LocalServer:

    def __init__(self, directory):
        self.directory = directory

        self.server = ThreadingHTTPServer(
            (HOST, PORT),
            lambda *args, **kwargs: LocalHandler(
                *args,
                directory=self.directory,
                **kwargs
            )
        )

        self.server.daemon_threads = True

        self.thread = threading.Thread(
            target=self.server.serve_forever,
            daemon=True
        )

    def start(self):
        self.thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


class HireflowWindow(QMainWindow):

    def __init__(self, server):
        super().__init__()

        self.server = server

        self.setWindowTitle(
            "HIREFLOW | HR Recruitment Workspace"
        )

        self.resize(1500, 950)
        self.setMinimumSize(1050, 700)

        icon_path = resource_path("assets/icon.ico")

        if icon_path.exists():
            self.setWindowIcon(QIcon(str(icon_path)))

        self.browser = QWebEngineView(self)

        # LocalStorage 및 브라우저 데이터 영구 저장
        profile = QWebEngineProfile.defaultProfile()

        storage = user_data_path()

        profile.setPersistentStoragePath(
            str(storage / "web-storage")
        )

        profile.setCachePath(
            str(storage / "cache")
        )

        settings = self.browser.settings()

        settings.setAttribute(
            QWebEngineSettings.WebAttribute.LocalStorageEnabled,
            True
        )

        settings.setAttribute(
            QWebEngineSettings.WebAttribute.JavascriptEnabled,
            True
        )

        settings.setAttribute(
            QWebEngineSettings.WebAttribute.JavascriptCanOpenWindows,
            False
        )

        settings.setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls,
            False
        )

        self.setCentralWidget(self.browser)

        self.browser.load(
            QUrl(f"http://{HOST}:{PORT}/index.html")
        )

    def closeEvent(self, event):
        self.server.stop()
        event.accept()


def main():

    app = QApplication(sys.argv)

    app.setApplicationName(APP_NAME)
    app.setOrganizationName(APP_NAME)

    site_directory = resource_path(".")

    if not (site_directory / "index.html").exists():
        QMessageBox.critical(
            None,
            "HIREFLOW 오류",
            "index.html 파일을 찾을 수 없습니다."
        )
        return 1

    try:
        server = LocalServer(site_directory)
        server.start()

    except OSError as error:
        QMessageBox.critical(
            None,
            "서버 실행 오류",
            f"HIREFLOW 로컬 서버를 실행하지 못했습니다.\n\n{error}"
        )
        return 1

    window = HireflowWindow(server)
    window.show()

    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
s