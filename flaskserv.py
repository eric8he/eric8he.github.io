from flask import Flask, send_from_directory
import os

app = Flask(__name__)

# Serve the index.html when accessing the root URL
@app.route('/')
def serve_index():
    return send_from_directory(os.getcwd(), 'index.html')

# Serve any file in the current directory
@app.route('/<path:filename>')
def serve_files(filename):
    return send_from_directory(os.getcwd(), filename)

if __name__ == '__main__':
    app.run(debug=True, port=8080)