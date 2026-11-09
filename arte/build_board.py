"""Capture the responsive presentation board in Chrome or Edge headless."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import subprocess
import tempfile
from threading import Thread


BASE = Path(__file__).resolve().parents[1]
OUTPUT = BASE / 'arte' / 'invista-modas-prancha.png'


def find_browser():
    candidates = [
        Path(os.environ.get('PROGRAMFILES(X86)', r'C:\Program Files (x86)')) / 'Google/Chrome/Application/chrome.exe',
        Path(os.environ.get('PROGRAMFILES', r'C:\Program Files')) / 'Google/Chrome/Application/chrome.exe',
        Path(os.environ.get('PROGRAMFILES(X86)', r'C:\Program Files (x86)')) / 'Microsoft/Edge/Application/msedge.exe',
        Path(os.environ.get('PROGRAMFILES', r'C:\Program Files')) / 'Microsoft/Edge/Application/msedge.exe',
    ]
    for executable in candidates:
        if executable.is_file():
            return executable
    raise FileNotFoundError('Google Chrome ou Microsoft Edge é necessário para capturar a prancha.')


def main():
    browser = find_browser()
    handler = partial(SimpleHTTPRequestHandler, directory=str(BASE))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/arte/prancha.html'
    try:
        with tempfile.TemporaryDirectory(prefix='invista-prancha-') as profile:
            args = [
                str(browser), '--headless=new', '--disable-gpu', '--disable-extensions',
                '--hide-scrollbars', f'--user-data-dir={profile}', '--window-size=1600,1200',
                '--force-device-scale-factor=1', '--virtual-time-budget=18000',
                f'--screenshot={OUTPUT}', url,
            ]
            subprocess.run(args, check=True, timeout=60, capture_output=True, text=True)
    finally:
        server.shutdown()
        server.server_close()

    if not OUTPUT.is_file() or OUTPUT.stat().st_size < 50000:
        raise RuntimeError('A captura da prancha ficou incompleta.')
    print(f'Prancha gerada: {OUTPUT} (1600×1200)')


if __name__ == '__main__':
    main()
