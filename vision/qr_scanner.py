"""
SmartPark – Python QR Scanner  (100% reliable fallback)
=========================================================
Uses OpenCV + pyzbar for guaranteed QR detection,
calls the SmartPark backend API to perform check-in / check-out,
and displays the booking details in a rich overlay.

Requirements:
    pip install opencv-python pyzbar requests python-dotenv

Run:
    python vision/qr_scanner.py                 # uses default webcam
    python vision/qr_scanner.py --source 1      # phone USB camera (index 1)
    python vision/qr_scanner.py --source rtsp://...  # IP stream

Windows note:
    pyzbar requires the 'zbar' DLL.  Download the Windows binary from:
    https://github.com/NaturalHistoryMuseum/pyzbar#windows
    or just run:  pip install pyzbar  (bundled on most modern installs)
"""

import cv2
import json
import time
import argparse
import requests
import threading
from datetime import datetime
from pyzbar import pyzbar          # pip install pyzbar
from dotenv import load_dotenv     # pip install python-dotenv
import os

# ─── Config ──────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env')) # Try frontend too

API_BASE = os.getenv("QR_API_BASE") or os.getenv("NEXT_PUBLIC_API_URL") or "http://localhost:5000/api"
HOST_TOKEN = os.getenv("HOST_AUTH_TOKEN", "")   # Set this once (see README below)

COOLDOWN_SECONDS = 5   # ignore same QR within this window (prevent double-scan)

# ─── Colours ────────────────────────────────────────────────────────────────
GREEN  = (0,  210, 110)
RED    = (0,   50, 220)
BLUE   = (220, 120,  0)
WHITE  = (255, 255, 255)
BLACK  = (0,     0,   0)
YELLOW = (0,   200, 255)


# ─── Camera helpers ──────────────────────────────────────────────────────────
def open_camera(source):
    """Open the best camera available. Phone USB cameras appear at index > 0."""
    if source is not None and not str(source).isdigit():
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            return cap
        raise RuntimeError(f"Cannot open stream: {source}")

    indices = []
    if source is not None:
        indices.append(int(source))
    indices += [i for i in range(7) if i not in indices]

    print("Scanning cameras …")
    available = []
    for idx in indices:
        cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)  # faster on Windows
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                print(f"  ✅ Camera {idx}: {w}×{h}")
                available.append((idx, cap, w * h))
                continue
        cap.release()

    if not available:
        raise RuntimeError(
            "No camera found. For phone USB: install DroidCam (Android) or EpocCam (iPhone)."
        )

    # Prefer explicit source, else highest resolution (usually phone)
    if source is not None:
        for idx, cap, _ in available:
            if idx == int(source):
                for oi, oc, _ in available:
                    if oi != idx: oc.release()
                print(f"📷 Using camera {idx} (requested).")
                return cap

    available.sort(key=lambda x: -x[2])
    best_idx, best_cap, _ = available[0]
    for idx, cap, _ in available[1:]: cap.release()
    print(f"📷 Using camera {best_idx} (best resolution).")
    return best_cap


# ─── QR Detection (pyzbar – far more reliable than OpenCV's built-in) ────────
def decode_qr(frame):
    """Return list of (data_str, polygon_points) for each QR code in frame."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # Enhance contrast for low-light / small QR codes
    gray = cv2.equalizeHist(gray)
    decoded = pyzbar.decode(gray, symbols=[pyzbar.ZBarSymbol.QRCODE])
    results = []
    for d in decoded:
        try:
            data = d.data.decode("utf-8")
            points = [(p.x, p.y) for p in d.polygon]
            results.append((data, points))
        except Exception:
            pass
    return results


# ─── Backend API call (runs in thread so it doesn't block the camera) ────────
_overlay = None   # {'type': 'success'|'error', 'lines': [...], 'until': time}
_overlay_lock = threading.Lock()


def set_overlay(type_, lines, duration=7):
    global _overlay
    with _overlay_lock:
        _overlay = {"type": type_, "lines": lines, "until": time.time() + duration}


def call_backend(payload_str: str):
    """Parse QR payload and call check-in then check-out API."""
    try:
        payload = json.loads(payload_str)
        booking_id = payload.get("bookingId")
        qr_token   = payload.get("qrToken")
        if not booking_id or not qr_token:
            set_overlay("error", ["Invalid QR Code", "Missing bookingId or qrToken"])
            return

        headers = {"Authorization": f"Bearer {HOST_TOKEN}",
                   "Content-Type": "application/json"}

        # ── Try Check-In ─────────────────────────────────────
        try:
            r = requests.post(
                f"{API_BASE}/bookings/{booking_id}/check-in",
                json={"qrToken": qr_token},
                headers=headers,
                timeout=6
            )
            if r.status_code == 200:
                b = r.json().get("booking", {})
                user = b.get("userId") or {}
                name    = user.get("name",  b.get("vehicleNumber", "—"))
                vehicle = b.get("vehicleNumber", "—")
                slot    = b.get("slotId", "—")
                phone   = user.get("phone", b.get("phoneNumber", "—"))
                set_overlay("success", [
                    "✅  CHECK-IN SUCCESSFUL",
                    f"Name:     {name}",
                    f"Vehicle:  {vehicle}",
                    f"Slot:     {slot}",
                    f"Phone:    {phone}",
                    f"Time:     {datetime.now().strftime('%H:%M:%S')}",
                ])
                return
            err = r.json().get("message", r.text)
        except requests.RequestException as e:
            set_overlay("error", ["Network error (check-in)", str(e)[:60]])
            return

        # ── Try Check-Out if check-in said "not eligible" ────
        if "not eligible" in err.lower() or "active" in err.lower() or "Forbidden" in err:
            try:
                r2 = requests.post(
                    f"{API_BASE}/bookings/{booking_id}/check-out",
                    json={"qrToken": qr_token},
                    headers=headers,
                    timeout=6
                )
                if r2.status_code == 200:
                    data    = r2.json()
                    b       = data.get("booking", {})
                    summary = data.get("summary",  {})
                    user    = b.get("userId") or {}
                    name    = user.get("name", "—")
                    vehicle = b.get("vehicleNumber", "—")
                    total   = summary.get("totalAmount", "—")
                    hours   = summary.get("durationHours", "—")
                    set_overlay("success", [
                        "✅  CHECK-OUT COMPLETE",
                        f"Name:     {name}",
                        f"Vehicle:  {vehicle}",
                        f"Duration: {hours} hrs",
                        f"Total:    ₹{total}",
                        f"Time:     {datetime.now().strftime('%H:%M:%S')}",
                    ])
                    return
                err2 = r2.json().get("message", r2.text)
                set_overlay("error", ["Check-Out Failed", err2[:70]])
            except requests.RequestException as e:
                set_overlay("error", ["Network error (check-out)", str(e)[:60]])
        else:
            set_overlay("error", ["Scan Failed", err[:70]])

    except json.JSONDecodeError:
        set_overlay("error", ["Invalid QR Code", "Not a SmartPark ticket"])
    except Exception as e:
        set_overlay("error", ["Unexpected error", str(e)[:70]])


# ─── Draw helpers ─────────────────────────────────────────────────────────────
def draw_qr_border(frame, points, color):
    if len(points) >= 4:
        pts = [(int(p[0]), int(p[1])) for p in points]
        for i in range(len(pts)):
            cv2.line(frame, pts[i], pts[(i + 1) % len(pts)], color, 3)


def draw_overlay_box(frame, lines, bg_color, h, w):
    """Draw a semi-transparent information panel on the bottom of the frame."""
    box_h = 28 + len(lines) * 28
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - box_h - 10), (w, h), bg_color, -1)
    cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
    for i, line in enumerate(lines):
        y = h - box_h + i * 28 + 22
        color = WHITE if i == 0 else (200, 200, 200)
        size  = 0.65 if i == 0 else 0.52
        thick = 2 if i == 0 else 1
        cv2.putText(frame, line, (12, y), cv2.FONT_HERSHEY_SIMPLEX, size, color, thick, cv2.LINE_AA)


# ─── Main loop ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="SmartPark Python QR Scanner")
    parser.add_argument("--source", default=None,
                        help="Camera index (0, 1, …) or stream URL")
    args = parser.parse_args()

    if not HOST_TOKEN:
        print("\n⚠  WARNING: HOST_AUTH_TOKEN is not set in backend/.env")
        print("   The scanner will open but API calls will be unauthorised.")
        print("   Add  HOST_AUTH_TOKEN=<your_host_jwt>  to backend/.env\n")

    print("=" * 55)
    print("  SmartPark – Python QR Scanner")
    print("=" * 55)

    cap = open_camera(args.source)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    last_scanned = {}   # payload_str -> timestamp (cooldown tracking)
    scanning_msg_shown = False

    print("\nScanner ready. Hold a SmartPark QR ticket in front of the camera.")
    print("Press  Q  to quit.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.05)
            continue

        h, w = frame.shape[:2]
        now = time.time()

        # ── Decode QR codes ──────────────────────────────────────────────────
        qrs = decode_qr(frame)

        for data, points in qrs:
            # Draw the QR border
            draw_qr_border(frame, points, GREEN)
            cv2.putText(frame, "SmartPark QR Detected", (int(points[0][0]), int(points[0][1]) - 12),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, GREEN, 2)

            # Respect cooldown
            if now - last_scanned.get(data, 0) < COOLDOWN_SECONDS:
                continue

            last_scanned[data] = now
            print(f"[{datetime.now().strftime('%H:%M:%S')}] QR scanned – calling API …")
            # Call API in background thread
            t = threading.Thread(target=call_backend, args=(data,), daemon=True)
            t.start()

        # ── Draw result overlay ───────────────────────────────────────────────
        with _overlay_lock:
            ov = _overlay

        if ov and ov["until"] > now:
            bg = (0, 130, 60) if ov["type"] == "success" else (0, 30, 180)
            draw_overlay_box(frame, ov["lines"], bg, h, w)
        else:
            # Idle guidance bar
            cv2.rectangle(frame, (0, 0), (w, 36), (0, 0, 0), -1)
            cv2.putText(frame, "SmartPark QR Scanner – Hold ticket in view",
                        (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.58, GREEN, 1)

        cv2.imshow("SmartPark – QR Scanner  [Q to quit]", frame)

        if cv2.waitKey(1) & 0xFF in (ord('q'), ord('Q'), 27):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Scanner stopped.")


if __name__ == "__main__":
    main()
