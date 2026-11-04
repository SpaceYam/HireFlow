
import sys
import os
import threading
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from PySide6.QtCore import QUrl
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QMessageBox
)
from PySide6.QtWebEngineCore import (
    QWebEngineProfile,
    QWebEngineSettings
)
from PySide6.QtWebEngineWidgets import QWebEngineView


# =========================================
# HIREFLOW CONFIGURATION
# =========================================

APP_NAME = "HIREFLOW"

HOST = "127.0.0.1"

# 기존 LocalStorage 데이터 유지를 위해 고정
PORT = 8765


# =========================================
# RESOURCE PATH
# =========================================

def resource_path(relative_path):

    if getattr(sys, "frozen", False):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(__file__).resolve().parent

    return base_path / relative_path


# =========================================
# USER DATA DIRECTORY
# =========================================

def user_data_path():

    if sys.platform == "win32":

        base = Path(
            os.environ.get(
                "LOCALAPPDATA",
                str(Path.home())
            )
        )

    else:

        base = (
            Path.home()
            / ".local"
            / "share"
        )

    path = base / APP_NAME

    path.mkdir(
        parents=True,
        exist_ok=True
    )

    return path


# =========================================
# LOCAL HTTP SERVER
# =========================================

class LocalHandler(SimpleHTTPRequestHandler):

    def __init__(
        self,
        *args,
        directory=None,
        **kwargs
    ):

        super().__init__(
            *args,
            directory=str(directory),
            **kwargs
        )

    def log_message(self, format, *args):
        pass


class LocalServer:

    def __init__(self, directory):

        self.server = ThreadingHTTPServer(
            (HOST, PORT),

            lambda *args, **kwargs:
                LocalHandler(
                    *args,
                    directory=directory,
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


# =========================================
# MAIN WINDOW
# =========================================

class HireflowWindow(QMainWindow):

    def __init__(self, server):

        super().__init__()

        self.server = server

        self.setWindowTitle(
            "HIREFLOW | HR Recruitment Workspace"
        )

        self.resize(1500, 950)

        self.setMinimumSize(
            1050,
            700
        )

        # =================================
        # ICON
        # =================================

        icon_path = resource_path(
            "assets/icon.ico"
        )

        if icon_path.exists():

            self.setWindowIcon(
                QIcon(str(icon_path))
            )

        # =================================
        # BROWSER PROFILE
        # =================================

        # 중요: 브라우저 프로필을 먼저 생성
        profile = QWebEngineProfile.defaultProfile()

        # =================================
        # PERSISTENT STORAGE
        # =================================

        storage = user_data_path()

        # LocalStorage 영구 저장 경로
        profile.setPersistentStoragePath(
            str(storage / "web-storage")
        )

        # 캐시 저장 경로
        profile.setCachePath(
            str(storage / "cache")
        )

        # =================================
        # WEB VIEW
        # =================================

        self.browser = QWebEngineView(self)

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

        self.setCentralWidget(
            self.browser
        )

        # =================================
        # LOAD APPLICATION
        # =================================

        # 포트 8765 고정
        self.browser.load(
            QUrl(
                f"http://{HOST}:{PORT}/index.html"
            )
        )

    # =====================================
    # CLOSE EVENT
    # =====================================

    def closeEvent(self, event):

        try:

            self.server.stop()

        except Exception as error:

            print(
                "SERVER SHUTDOWN ERROR:",
                error
            )

        event.accept()


# =========================================
# APPLICATION START
# =========================================

def main():

    app = QApplication(sys.argv)

    app.setApplicationName(
        APP_NAME
    )

    app.setOrganizationName(
        APP_NAME
    )

    # =====================================
    # CHECK INDEX.HTML
    # =====================================

    site_directory = resource_path(".")

    index_file = (
        site_directory / "index.html"
    )

    if not index_file.exists():

        QMessageBox.critical(
            None,
            "HIREFLOW 오류",
            "index.html 파일을 찾을 수 없습니다."
        )

        return 1

    # =====================================
    # START SERVER
    # =====================================

    try:

        server = LocalServer(
            str(site_directory)
        )

        server.start()

    except OSError as error:

        QMessageBox.critical(
            None,
            "서버 실행 오류",
            "HIREFLOW 로컬 서버를 실행하지 못했습니다.\n\n"
            + str(error)
        )

        return 1

    # =====================================
    # CREATE WINDOW
    # =====================================

    window = HireflowWindow(server)

    window.show()

    return app.exec()


# =========================================
# ENTRY POINT
# =========================================

if __name__ == "__main__":

    sys.exit(main())
