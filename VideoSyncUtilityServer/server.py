#!/usr/bin/env python
"""
Simple HTTP server
Only handles POST requests
Looks for encrypted crunchyroll url,
unencrypts it with streamlink and sends back
the unencrypted HLS URL.
"""
import sys
import json
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from cgi import parse_header, parse_multipart
from urlparse import parse_qs
from streamlink import Streamlink, PluginError, NoPluginError



class Server(BaseHTTPRequestHandler):
    """Simple HTTP server class"""
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_POST(self):
        """Process POST request"""
        ctype, pdict = parse_header(self.headers.getheader('content-type'))
        print ctype
        if ctype == 'multipart/form-data':
            postvars = parse_multipart(self.rfile, pdict)
        elif ctype == 'application/x-www-form-urlencoded':
            length = int(self.headers.getheader('content-length'))
            postvars = parse_qs(self.rfile.read(length), keep_blank_values=1)
        else:
            postvars = {}
        print postvars

        if postvars["enc-url"]:
            enc_url = postvars["enc-url"]
            post_url = extract_stream(enc_url)
            self._set_headers()
            self.wfile.write(json.dumps({"unenc-url": post_url}))



def extract_stream(stream_url):
    """extracts the stream url from the encrypted url"""
    url = stream_url[0]

    print "Attempting to extract {0}".format(url)
    # Create the Streamlink session
    streamlink = Streamlink()

    #stream quality
    quality = "best"
    # Enable logging
    streamlink.set_loglevel("info")
    streamlink.set_logoutput(sys.stdout)

    # Attempt to fetch streams
    try:
        streams = streamlink.streams(url)
    except NoPluginError:
        exit("Streamlink is unable to handle the URL '{0}'".format(url))
    except PluginError as err:
        exit("Plugin error: {0}".format(err))

    if not streams:
        exit("No streams found on URL '{0}'".format(url))

    # Look for specified stream
    if quality not in streams:
        exit("Unable to find '{0}' stream on URL '{1}'".format(quality, url))

    # We found the stream
    stream = streams[quality]

    return stream.url


def run(server_class=HTTPServer, handler_class=Server, port=8080):
    """Call to initialize and run the server"""
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

def main():
    """Main function"""
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()

if __name__ == '__main__':
    main()
