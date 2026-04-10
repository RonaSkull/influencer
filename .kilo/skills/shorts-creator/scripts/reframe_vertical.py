#!/usr/bin/env python3
"""
Convert landscape video to 9:16 vertical format for social media.
Supports multiple re-framing strategies: zoom-center, letterbox, split-screen.
"""

import argparse
import subprocess
import sys
from pathlib import Path

def reframe_zoom_center(input_path, output_path, target_width=1080, target_height=1920):
    """
    Zoom and center crop strategy.
    Crops sides, keeps center in focus.
    """
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-vf', f'scale=-1:{target_height},crop={target_width}:{target_height}',
        '-c:v', 'libx264',
        '-c:a', 'copy',
        '-preset', 'medium',
        '-crf', '23',
        '-y',
        str(output_path)
    ]
    
    print(f"🎥 Re-framing with zoom-center strategy...")
    return run_ffmpeg(cmd, output_path)

def reframe_letterbox(input_path, output_path, target_width=1080, target_height=1920, blur=True):
    """
    Letterbox strategy with blurred background.
    Original video centered, sides filled with blurred/colored bars.
    """
    if blur:
        # Blurred background version
        filter_complex = (
            f"[0:v]scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,"
            f"pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:black,"
            f"split[main][blur];"
            "[blur]scale={target_width}:{target_height},boxblur=20[bg];"
            "[bg][main]overlay=(W-w)/2:(H-h)/2"
        )
    else:
        # Simple black bars
        filter_complex = (
            f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,"
            f"pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:black"
        )
    
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-filter_complex', filter_complex,
        '-c:v', 'libx264',
        '-c:a', 'copy',
        '-preset', 'medium',
        '-crf', '23',
        '-y',
        str(output_path)
    ]
    
    print(f"🎥 Re-framing with letterbox strategy (blur={blur})...")
    return run_ffmpeg(cmd, output_path)

def reframe_split_screen(input_path, output_path, target_width=1080, target_height=1920):
    """
    Split-screen strategy.
    Top half: original video (small)
    Bottom half: zoomed detail
    """
    filter_complex = (
        f"[0:v]split=2[top][bottom];"
        f"[top]scale={target_width}:{target_height//2}:force_original_aspect_ratio=decrease,"
        f"pad={target_width}:{target_height//2}:(ow-iw)/2:(oh-ih)/2:black[t];"
        f"[bottom]scale=-1:{target_height},crop={target_width}:{target_height//2}[b];"
        f"[t][b]vstack"
    )
    
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-filter_complex', filter_complex,
        '-c:v', 'libx264',
        '-c:a', 'copy',
        '-preset', 'medium',
        '-crf', '23',
        '-y',
        str(output_path)
    ]
    
    print(f"🎥 Re-framing with split-screen strategy...")
    return run_ffmpeg(cmd, output_path)

def run_ffmpeg(cmd, output_path):
    """Execute FFmpeg command and handle errors."""
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ Vertical video saved to {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg error: {e.stderr}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Convert video to 9:16 vertical")
    parser.add_argument("--input", required=True, help="Input video file")
    parser.add_argument("--output", required=True, help="Output file path")
    parser.add_argument("--strategy", default="zoom-center", 
                       choices=["zoom-center", "letterbox", "letterbox-blur", "split-screen"],
                       help="Re-framing strategy")
    parser.add_argument("--width", type=int, default=1080, help="Target width (default: 1080)")
    parser.add_argument("--height", type=int, default=1920, help="Target height (default: 1920)")
    
    args = parser.parse_args()
    
    # Validate input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ Input file not found: {input_path}")
        sys.exit(1)
    
    # Apply strategy
    if args.strategy == "zoom-center":
        success = reframe_zoom_center(input_path, args.output, args.width, args.height)
    elif args.strategy == "letterbox":
        success = reframe_letterbox(input_path, args.output, args.width, args.height, blur=False)
    elif args.strategy == "letterbox-blur":
        success = reframe_letterbox(input_path, args.output, args.width, args.height, blur=True)
    elif args.strategy == "split-screen":
        success = reframe_split_screen(input_path, args.output, args.width, args.height)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
