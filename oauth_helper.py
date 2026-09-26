#!/usr/bin/env python3
"""
OAuth helper per generare GOOGLE_REFRESH_TOKEN_ANALYTICS
Avvia un server locale sulla porta 8080 che cattura il callback OAuth
"""
import http.server
import urllib.parse
import urllib.request
import json
import threading
import sys
import os

CLIENT_ID = "901016751362-erqp8k9ejf1qjdb98j8igmp9n1s2ju0o.apps.googleusercontent.com"
# Client secret deve essere passato come env var o arg
CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", "")
REDIRECT_URI = "http://localhost:8080/callback"
SCOPES = "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly"

refresh_token_result = None

class OAuthHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Silenzia i log HTTP
    
    def do_GET(self):
        global refresh_token_result
        parsed = urllib.parse.urlparse(self.path)
        
        if parsed.path == "/callback":
            params = urllib.parse.parse_qs(parsed.query)
            code = params.get("code", [None])[0]
            error = params.get("error", [None])[0]
            
            if error:
                self.send_response(400)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(f"<h2>❌ Errore: {error}</h2>".encode())
                return
            
            if not code:
                self.send_response(400)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(b"<h2>Nessun code ricevuto</h2>")
                return
            
            # Scambia code con token
            data = urllib.parse.urlencode({
                "code": code,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code"
            }).encode()
            
            req = urllib.request.Request(
                "https://oauth2.googleapis.com/token",
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            try:
                with urllib.request.urlopen(req) as resp:
                    token_data = json.loads(resp.read())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(f"<h2>Errore scambio token: {e}</h2>".encode())
                return
            
            refresh_token = token_data.get("refresh_token", "")
            refresh_token_result = refresh_token
            
            html = f"""<html><body style="font-family:sans-serif;padding:32px;max-width:700px">
<h2>✅ Refresh Token ottenuto!</h2>
<p>Copia questo valore nel secret Cloudflare <strong>GOOGLE_REFRESH_TOKEN_ANALYTICS</strong>:</p>
<textarea style="width:100%;height:100px;font-family:monospace;font-size:.9rem;padding:8px;border:2px solid #4285F4;border-radius:6px" onclick="this.select()">{refresh_token}</textarea>
<br><br>
<p>Il server locale può essere chiuso. Puoi ora chiudere questa finestra.</p>
<script>
// Mostra anche in console per copiare
console.log('REFRESH TOKEN:', '{refresh_token}');
// Seleziona automaticamente
document.querySelector('textarea').select();
</script>
</body></html>"""
            
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(html.encode())
            
            # Stampa anche su stdout per cattura
            print(f"\n{'='*60}")
            print(f"GOOGLE_REFRESH_TOKEN_ANALYTICS={refresh_token}")
            print(f"{'='*60}\n")
            sys.stdout.flush()
            
            # Ferma il server dopo 3 secondi
            threading.Timer(3, lambda: sys.exit(0)).start()
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    if not CLIENT_SECRET:
        print("ERRORE: Imposta GOOGLE_OAUTH_CLIENT_SECRET come variabile d'ambiente")
        sys.exit(1)
    
    # Genera URL OAuth
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={urllib.parse.quote(CLIENT_ID)}"
        f"&redirect_uri={urllib.parse.quote(REDIRECT_URI)}"
        f"&response_type=code"
        f"&scope={urllib.parse.quote(SCOPES)}"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    
    print(f"\n{'='*60}")
    print("OAUTH HELPER - Google Analytics + Search Console")
    print(f"{'='*60}")
    print(f"\nServer avviato su http://localhost:8080")
    print(f"\nApri questo URL nel browser:\n")
    print(auth_url)
    print(f"\nDopo l'autorizzazione, il refresh token apparirà qui sotto.")
    print(f"{'='*60}\n")
    sys.stdout.flush()
    
    server = http.server.HTTPServer(("0.0.0.0", 8080), OAuthHandler)
    server.serve_forever()
