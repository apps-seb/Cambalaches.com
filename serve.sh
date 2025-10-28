#!/bin/bash
# Serve the application and display IP addresses for mobile testing.

PORT=8000

echo "Starting local web server on port $PORT..."
echo ""
echo "-------------------------------------------------"
echo "OPEN ONE OF THESE ADDRESSES IN YOUR BROWSER:"
echo ""
echo "Desktop Access: http://localhost:$PORT"
echo ""

# Find and display local IP addresses
echo "Mobile Access (connect phone to the same Wi-Fi):"
if command -v ip &>/dev/null; then
    ip -4 addr | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | while read -r IP; do
        echo "   --> http://$IP:$PORT"
    done
elif command -v ifconfig &>/dev/null; then
    ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | while read -r IP; do
        echo "   --> http://$IP:$PORT"
    done
fi

echo "-------------------------------------------------"
echo ""
echo "When you are done, press Ctrl+C to stop the server."
echo ""

# Use Python 3 if available, otherwise fall back to Python 2
if command -v python3 &>/dev/null; then
    python3 -m http.server $PORT
else
    python -m SimpleHTTPServer $PORT
fi
