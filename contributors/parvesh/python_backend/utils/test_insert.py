import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")
supabase = create_client(url, key)

try:
    print("Testing insert with 'user_email'...")
    res = supabase.table("chat_messages").insert({
        "user_email": "test@example.com",
        "message": "Hello world"
    }).execute()
    print("Success with 'user_email'!")
except Exception as e1:
    print(f"Failed with 'user_email': {e1}")
    try:
        print("Testing insert with 'user_name'...")
        res = supabase.table("chat_messages").insert({
            "user_name": "test",
            "message": "Hello world"
        }).execute()
        print("Success with 'user_name'!")
    except Exception as e2:
        print(f"Failed with 'user_name': {e2}")
