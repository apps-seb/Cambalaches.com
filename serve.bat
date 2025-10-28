@echo off
setlocal

set "PORT=8000"

echo Starting local web server on port %PORT%...
echo.
echo -------------------------------------------------
echo OPEN ONE OF THESE ADDRESSES IN YOUR BROWSER:
echo.
echo Desktop Access: http://localhost:%PORT%
echo.
echo Mobile Access (connect phone to the same Wi-Fi^):

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    for /f "tokens=*" %%b in ("%%a") do (
        echo    --^> http://%%b:%PORT%
    )
)

echo -------------------------------------------------
echo.
echo When you are done, press Ctrl+C to stop the server.
echo.

REM Check for python3 and use it if available
where python3 >nul 2>nul
if %errorlevel% == 0 (
    echo Found Python 3. Starting server...
    python3 -m http.server %PORT%
) else (
    echo Python 3 not found, trying Python 2...
    python -m SimpleHTTPServer %PORT%
)

endlocal
