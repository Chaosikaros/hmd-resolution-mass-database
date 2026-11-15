"""Loopback-only static preview under a GitHub Pages-style repository prefix."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import webbrowser

ROOT=Path(__file__).resolve().parents[1]

def handler(prefix):
    class ProjectHandler(SimpleHTTPRequestHandler):
        # Windows can register CSV as Excel; serve the actual UTF-8 file format.
        extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                          '.csv': 'text/csv; charset=utf-8',
                          '.md': 'text/plain; charset=utf-8'}
        def do_GET(self):
            raw=urlsplit(self.path)
            if raw.path in ['/', prefix.rstrip('/')]:
                self.send_response(302);self.send_header('Location',prefix);self.end_headers();return
            decoded=unquote(raw.path)
            if not decoded.startswith(prefix) or any(p in ['..','.git'] for p in decoded.split('/')):
                self.send_error(404);return
            self.path=raw.path[len(prefix)-1:]+('?' + raw.query if raw.query else '')
            super().do_GET()
        def do_HEAD(self):
            raw=urlsplit(self.path);decoded=unquote(raw.path)
            if not decoded.startswith(prefix) or any(p in ['..','.git'] for p in decoded.split('/')):
                self.send_error(404);return
            self.path=raw.path[len(prefix)-1:]
            super().do_HEAD()
        def list_directory(self,path):
            self.send_error(404);return None
        def end_headers(self):
            name = Path(unquote(urlsplit(self.path).path)).name
            if name.endswith('.csv'):
                self.send_header('Content-Disposition', f'attachment; filename="{name}"')
            self.send_header('Cache-Control','no-cache')
            self.send_header('X-Content-Type-Options','nosniff')
            super().end_headers()
    return ProjectHandler

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port',type=int,default=8788)
    parser.add_argument('--prefix',default='hmd-resolution-mass-database')
    parser.add_argument('--open',action='store_true')
    args=parser.parse_args()
    if not (ROOT/'site/index.html').is_file():
        raise SystemExit('The site/index.html file is missing.')
    prefix='/'+args.prefix.strip('/')+'/'
    url=f'http://127.0.0.1:{args.port}{prefix}'
    server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(handler(prefix),directory=str(ROOT/'site')))
    print(f'Local preview: {url}',flush=True)
    print('Serving site/ only.',flush=True)
    if args.open:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__':main()
