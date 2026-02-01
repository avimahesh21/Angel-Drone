import cv2
import sys
import time

HLS_URL = "http://10.172.11.100:8080/live/dji.m3u8"  # change stream name if needed

cap = cv2.VideoCapture(HLS_URL)

if not cap.isOpened():
    print("Failed to open HLS stream.")
    print("Tip: try the ffmpeg-pipe version (Option B) if this fails.")
    sys.exit(1)

last_ok = time.time()

while True:
    ok, frame = cap.read()
    if not ok or frame is None:
        # HLS may stall briefly between segments; wait a bit
        if time.time() - last_ok > 5:
            print("No frames for 5s. Stream stalled or URL wrong.")
            last_ok = time.time()
        time.sleep(0.02)
        continue

    last_ok = time.time()
    cv2.imshow("HLS Stream", frame)

    # ESC to quit
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
