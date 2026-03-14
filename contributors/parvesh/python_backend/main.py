import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from typing import List, Dict
import uuid
import hashlib

# Load environment variables
load_dotenv()

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "FastAPI is running"}

# Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv('SECRET_KEY', 'super_secret_chemsage_key')
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
url: str = os.getenv("SUPABASE_URL", "https://jrvuwcumnrwvuyqtqnzs.supabase.co")
key: str = os.getenv("SUPABASE_SECRET_KEY", "sb_secret_HvXWGTLTsrqqtsRNglOXOw_e0yPX-Bk")
supabase: Client = create_client(url, key)

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        # user_name -> List[WebSocket] (to handle multiple tabs for same user)
        self.user_to_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_name: str):
        await websocket.accept()
        if user_name not in self.user_to_connections:
            self.user_to_connections[user_name] = []
        self.user_to_connections[user_name].append(websocket)
        await self.broadcast_users()

    async def disconnect(self, websocket: WebSocket, user_name: str):
        if user_name in self.user_to_connections:
            if websocket in self.user_to_connections[user_name]:
                self.user_to_connections[user_name].remove(websocket)
            if not self.user_to_connections[user_name]:
                del self.user_to_connections[user_name]
        await self.broadcast_users()

    async def broadcast_users(self):
        # Broadcast the list of unique online users
        unique_users = list(self.user_to_connections.keys())
        await self.broadcast({"type": "user_list", "users": unique_users})

    async def send_personal_message(self, message: dict, user_name: str):
        if user_name in self.user_to_connections:
            import asyncio
            for connection in self.user_to_connections[user_name]:
                try:
                    await asyncio.wait_for(connection.send_json(message), timeout=2.0)
                except Exception:
                    pass # Cleanup will happen on next broadcast or disconnect event

    async def broadcast(self, message: dict):
        all_conns = [conn for conns in self.user_to_connections.values() for conn in conns]
        if not all_conns:
            return
            
        import asyncio
        async def safe_send(conn):
            try:
                await asyncio.wait_for(conn.send_json(message), timeout=2.0)
            except Exception:
                return conn
            return None

        results = await asyncio.gather(*(safe_send(c) for c in all_conns))
        
        # Dead connection cleanup is handled by WebSocketDisconnect in the endpoint
        # but we can proactively remove here if needed by finding which user they belong to.

manager = ConnectionManager()

@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
        
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        response = supabase.table('profiles').select('*').eq('email', email).execute()
        user = response.data[0] if response.data else None

        if user and check_password_hash(user['password_hash'], password):
            request.session['user_id'] = user['id']
            request.session['user_email'] = user['email']
            return {'message': 'Login successful', 'status': 'success', 'redirect': '/dashboard'}
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during login")

@app.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {'message': 'Logged out successfully', 'status': 'success'}

@app.post("/register")
async def register(request: Request):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
        
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        response = supabase.table('profiles').select('id').eq('email', email).execute()
        if response.data:
            raise HTTPException(status_code=400, detail="User already exists")

        password_hash = generate_password_hash(password)
        supabase.table('profiles').insert({
            'email': email,
            'password_hash': password_hash
        }).execute()

        return {'message': 'Registration successful', 'status': 'success'}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        if 'duplicate key' in str(e).lower():
            raise HTTPException(status_code=400, detail="User already exists")
        raise HTTPException(status_code=500, detail=f"Error during registration: {e}")

@app.get("/me")
async def get_me(request: Request):
    print("GET /me request received")
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    try:
        response = supabase.table('profiles').select('email').eq('id', user_id).execute()
        if response.data:
            return {"email": response.data[0]['email']}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    user = websocket.query_params.get("user", "Anonymous")
    print(f"DEBUG: WebSocket connection attempt from {user}")
    try:
        await manager.connect(websocket, user)
        print(f"DEBUG: WebSocket connected and accepted for {user}")
    except Exception as e:
        print(f"DEBUG: Connection failed for {user}: {e}")
        return
    
    # Fetch recent messages on connect
    try:
        history = supabase.table('chat_messages').select('*').order('created_at', desc=True).limit(50).execute()
        if history.data:
            for msg in reversed(history.data):
                # Stable ID for history
                msg_id = hashlib.md5(f"{msg['user_email']}{msg['message']}{msg['created_at']}".encode()).hexdigest()
                await websocket.send_json({
                    "id": msg_id,
                    "user": msg['user_email'].split('@')[0],
                    "text": msg['message'],
                    "time": msg['created_at']
                })
    except Exception as e:
        print(f"Error fetching chat history: {e}")

    try:
        while True:
            data = await websocket.receive_json()
            # data: { "user": "...", "text": "...", "time": "...", "to": "Global" or "recipient" }
            
            # Generate a unique ID for this message session
            msg_id = str(uuid.uuid4())
            data["id"] = msg_id
            
            recipient = data.get("to", "Global")
            print(f"Message from {user} to {recipient}: {data.get('text')[:30]}...")
            
            # Save to Supabase (omit id column to let DB generate it)
            try:
                supabase.table('chat_messages').insert({
                    'user_email': data.get('user', user),
                    'message': data.get('text', '')
                }).execute()
            except Exception as e:
                print(f"Error saving message: {e}")
                
            if recipient == "Global":
                await manager.broadcast(data)
            else:
                # Private Message: Send to recipient AND sender
                await manager.send_personal_message(data, recipient)
                await manager.send_personal_message(data, user)
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket, user)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
