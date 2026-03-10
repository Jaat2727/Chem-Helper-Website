import os
from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Add a secret key to enable Flask sessions
app.secret_key = os.getenv('SECRET_KEY', 'super_secret_chemsage_key')

# Supabase configuration
url: str = os.getenv("SUPABASE_URL", "https://jrvuwcumnrwwuyqtqnzs.supabase.co")
key: str = os.getenv("SUPABASE_SECRET_KEY", "sb_secret_HvXWGTLTsrqqtsRNglOXOw_e0yPX-Bk")
supabase: Client = create_client(url, key)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required', 'status': 'error'}), 400

    try:
        # Query user from Supabase
        response = supabase.table('user').select('*').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            return jsonify({'message': 'Login successful', 'status': 'success', 'redirect': '/dashboard'}), 200
        else:
            return jsonify({'message': 'Invalid email or password', 'status': 'error'}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'An error occurred during login', 'status': 'error'}), 500

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

    try:
        # Check if user already exists
        response = supabase.table('user').select('id').eq('email', email).execute()
        if response.data:
            return jsonify({'message': 'User already exists', 'status': 'error'}), 400

        # Hash password and insert into Supabase
        password_hash = generate_password_hash(password)
        insert_response = supabase.table('user').insert({
            'email': email,
            'password_hash': password_hash
        }).execute()

        return jsonify({'message': 'Registration successful', 'status': 'success'}), 201
    except Exception as e:
        print(f"Registration error: {e}")
        # Check for unique constraint violation (though we check manually above)
        if 'duplicate key' in str(e).lower():
            return jsonify({'message': 'User already exists', 'status': 'error'}), 400
        return jsonify({'message': f'Error during registration: {e}', 'status': 'error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
