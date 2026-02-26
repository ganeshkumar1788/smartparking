"""
SmartPark – Movement Detector
Uses YOLOv8-nano for real-time vehicle & person detection.
Supports:
  • Laptop webcam
  • Phone connected as USB webcam (via apps like DroidCam / EpocCam)
  • IP camera stream (RTSP/HTTP)

Run:  python vision/move_detector.py
      python vision/move_detector.py --source 1          # try camera index 1
      python vision/move_detector.py --source rtsp://...  # IP stream
"""

import cv2
import argparse
import time
from datetime import datetime
from ultralytics import YOLO

# ─── COCO class ids we care about ────────────────────────────────────────────
TARGET_CLASSES = {
    0:  ("Person",       (0,   200, 100)),   # green
    2:  ("Car",          (255, 100, 0  )),   # orange
    3:  ("Motorcycle",   (255, 200, 0  )),   # yellow
    5:  ("Bus",          (200, 0,   255)),   # purple
    7:  ("Truck",        (0,   100, 255)),   # blue
}

CONF_THRESHOLD = 0.45


# ─── Helper: scan camera indices and pick the best one ───────────────────────
def find_usb_camera(prefer_index: int | None = None) -> cv2.VideoCapture:
    """
    Try to open a camera. Strategy:
      1. If --source is a stream URL, open directly.
      2. If --source is an explicit index, try that first.
      3. Otherwise, scan indices 0-5 and prefer the phone camera
         (higher index = more likely external USB device on Windows).
    Returns an opened VideoCapture or raises RuntimeError.
    """
    if prefer_index is not None and isinstance(prefer_index, str) and not prefer_index.isdigit():
        # It's a URL / RTSP stream
        cap = cv2.VideoCapture(prefer_index)
        if cap.isOpened():
            print(f"📡 Opened stream:  {prefer_index}")
            return cap
        raise RuntimeError(f"Cannot open stream: {prefer_index}")

    # Determine search order ─ test prefer_index first, then all others
    indices = []
    if prefer_index is not None:
        indices.append(int(prefer_index))
    indices += [i for i in range(6) if i != (int(prefer_index) if prefer_index else -1)]

    available = []
    print("Scanning available cameras …")
    for idx in indices:
        cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)   # CAP_DSHOW is faster on Windows
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                print(f"  ✅ Camera {idx}: {w}x{h}")
                available.append((idx, cap, w * h))
                continue
        cap.release()

    if not available:
        raise RuntimeError(
            "No camera found.\n"
            "• For phone via USB: install DroidCam (Android) or EpocCam (iPhone)\n"
            "  and enable USB mode inside the app.\n"
            "• Run again with  --source 1  (or 2, 3 …) to pick a specific camera."
        )

    # Sort by resolution descending — phone cameras are usually highest res
    available.sort(key=lambda x: -x[2])

    # If explicit index was requested and found, prefer it
    if prefer_index is not None:
        for idx, cap, _ in available:
            if idx == int(prefer_index):
                # Release others
                for oi, oc, _ in available:
                    if oi != idx:
                        oc.release()
                print(f"📷 Using camera {idx} (requested).")
                return cap

    best_idx, best_cap, best_res = available[0]
    for idx, cap, _ in available[1:]:
        cap.release()
    print(f"📷 Using camera {best_idx} (highest resolution: {best_res}px²).")
    return best_cap


# ─── Draw overlay ─────────────────────────────────────────────────────────────
def draw_detection(frame, box, label, color):
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    # Filled header bar
    cv2.rectangle(frame, (x1, y1 - 22), (x2, y1), color, -1)
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(frame, label, (x1 + 4, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="SmartPark Movement Detector")
    parser.add_argument("--source", default=None,
                        help="Camera index (0,1,2…) or RTSP/HTTP stream URL")
    parser.add_argument("--model", default="yolov8n.pt",
                        help="YOLO model file (default: yolov8n.pt)")
    parser.add_argument("--conf", type=float, default=CONF_THRESHOLD,
                        help="Confidence threshold (default: 0.45)")
    args = parser.parse_args()

    print("=" * 50)
    print("  SmartPark – Movement Detector")
    print("=" * 50)
    print(f"Loading model: {args.model}  …")
    model = YOLO(args.model)
    print("Model ready.\n")

    cap = find_usb_camera(args.source)

    # Optimise capture
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)   # reduce latency
    cap.set(cv2.CAP_PROP_FPS, 30)

    frame_count = 0
    fps_start = time.time()
    fps = 0.0

    print("Press  Q  to quit.")
    print("-" * 50)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠ Frame grab failed. Retrying …")
            time.sleep(0.1)
            continue

        frame_count += 1

        # Calculate FPS every 30 frames
        if frame_count % 30 == 0:
            fps = 30 / (time.time() - fps_start)
            fps_start = time.time()

        # ── Inference ────────────────────────────────────────────────────────
        results = model(frame, verbose=False, conf=args.conf)[0]

        person_count = 0
        vehicle_count = 0

        for box in results.boxes:
            cls  = int(box.cls[0])
            conf = float(box.conf[0])
            if cls not in TARGET_CLASSES:
                continue

            name, color = TARGET_CLASSES[cls]
            label = f"{name} {conf:.0%}"
            draw_detection(frame, box, label, color)

            if cls == 0:
                person_count += 1
            else:
                vehicle_count += 1

        # ── HUD overlay ──────────────────────────────────────────────────────
        timestamp = datetime.now().strftime("%H:%M:%S")
        cv2.rectangle(frame, (0, 0), (260, 90), (0, 0, 0), -1)
        cv2.putText(frame, f"SmartPark Vision", (8, 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 200, 120), 2)
        cv2.putText(frame, f"Persons:  {person_count}", (8, 46),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"Vehicles: {vehicle_count}", (8, 66),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(frame, f"FPS: {fps:.1f}  {timestamp}", (8, 86),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (150, 150, 150), 1)

        cv2.imshow("SmartPark – Movement Detection  [Q to quit]", frame)

        if cv2.waitKey(1) & 0xFF in (ord('q'), ord('Q'), 27):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Detector stopped.")


if __name__ == "__main__":
    main()
