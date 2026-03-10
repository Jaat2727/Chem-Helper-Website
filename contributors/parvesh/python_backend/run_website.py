import sqlite3
from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
# Add a secret key to enable Flask sessions
app.secret_key = 'super_secret_chemsage_key'

# Use an absolute path for the SQLite database so it's created correctly
basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(basedir, '../users.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Initialize the database table when the file is loaded
init_db()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required', 'status': 'error'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        return jsonify({'message': 'Login successful', 'status': 'success', 'redirect': '/dashboard'}), 200
    else:
        return jsonify({'message': 'Invalid email or password', 'status': 'error'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully', 'status': 'success'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required', 'status': 'error'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE email = ?', (email,)).fetchone()
    
    if user:
        conn.close()
        return jsonify({'message': 'User already exists', 'status': 'error'}), 400

    password_hash = generate_password_hash(password)
    try:
        conn.execute('INSERT INTO user (email, password_hash) VALUES (?, ?)', (email, password_hash))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'User already exists', 'status': 'error'}), 400
    finally:
        conn.close()

    return jsonify({'message': 'Registration successful', 'status': 'success'}), 201



if __name__ == '__main__':
    app.run(debug=True)
