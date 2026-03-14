import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")
supabase = create_client(url, key)

try:
    # Try to fetch one row to see columns
    res = supabase.table("chat_messages").select("*").limit(1).execute()
    print("Columns in chat_messages:")
    if res.data:
        print(list(res.data[0].keys()))
    else:
        print("Table is empty, cannot determine columns from select.")
        # Try to insert a dummy row to test column names
        # We can't easily get schema without special permissions, 
        # so we'll just try to deduce from errors if needed.
except Exception as e:
    print(f"Error checking DB: {e}")
