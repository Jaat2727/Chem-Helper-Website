import sqlite3
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import os
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='html_pages', static_folder='website_assets')
# Add a secret key to enable Flask sessions
app.secret_key = 'super_secret_chemsage_key'

# Store OTPs temporarily. In production, use Redis or DB with expiration.
otp_storage = {}

# Use an absolute path for the SQLite database so it's created correctly
basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(basedir, 'users.db')

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

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template('login_and_register.html')

@app.route('/home')
def home():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('user_dashboard.html', email=session.get('user_email'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

def send_otp_email(recipient_email, otp):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_APP_PASSWORD")
    
    if not sender_email or not sender_password:
        print("Warning: Email credentials not configured in .env file.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = "ChemSAGE - Your Registration OTP"
        
        body = f"Your One Time Password (OTP) for ChemSAGE registration is: {otp}\n\nPlease do not share this with anyone."
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/request-otp', methods=['POST'])
def request_otp():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
         return jsonify({'message': 'Email is required', 'status': 'error'}), 400
         
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user:
         return jsonify({'message': 'User already exists', 'status': 'error'}), 400
         
    otp = str(random.randint(100000, 999999))
    otp_storage[email] = otp
    
    success = send_otp_email(email, otp)
    
    if success:
        return jsonify({'message': 'OTP sent to your email', 'status': 'success'}), 200
    else:
        print(f"TESTING OTP for {email}: {otp}")
        return jsonify({'message': 'Failed to send email. Check console if testing locally.', 'status': 'error', 'testing_otp': otp}), 500

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_otp = data.get('otp')

    if not email or not password or not user_otp:
        return jsonify({'message': 'Email, password, and OTP are required', 'status': 'error'}), 400

    stored_otp = otp_storage.get(email)
    
    if not stored_otp or stored_otp != user_otp:
        return jsonify({'message': 'Invalid or expired OTP', 'status': 'error'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user WHERE email = ?', (email,)).fetchone()
    
    if user:
        conn.close()
        return jsonify({'message': 'User already exists', 'status': 'error'}), 400

    password_hash = generate_password_hash(password)
    try:
        conn.execute('INSERT INTO user (email, password_hash) VALUES (?, ?)', (email, password_hash))
        conn.commit()
        if email in otp_storage:
             del otp_storage[email]
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'User already exists', 'status': 'error'}), 400
    finally:
        conn.close()

    return jsonify({'message': 'Registration successful', 'status': 'success'}), 201

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
        # Instead of just sending a success message, we can tell the frontend to reload 
        # which will trigger the redirect to /home, or just send a redirect URL
        return jsonify({'message': 'Login successful', 'status': 'success', 'redirect': '/home'}), 200
    else:
        return jsonify({'message': 'Invalid email or password', 'status': 'error'}), 401

if __name__ == '__main__':
    app.run(debug=True)
