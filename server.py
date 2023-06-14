import sys
from http.server import HTTPServer, BaseHTTPRequestHandler;

class MyHandler( BaseHTTPRequestHandler ):
    def do_GET(self):
        print('GET: ' + self.path)
        self.send_response(200)
        self.send_header( "Access-Control-Allow-Origin", "*")
        self.end_headers()


    def do_POST(self):
        print('POST: ' + self.path)
        # content_length = int(self.headers['Content-Length']);
        # data = self.rfile.read(content_length);

        #Sending Response to Page
        self.send_response(200); # OK
        self.send_header( "Access-Control-Allow-Origin", "*")
        self.end_headers()




if __name__ == "__main__":
    httpd = HTTPServer( ( 'localhost', int(sys.argv[1]) ), MyHandler );
    httpd.serve_forever()
