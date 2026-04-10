#!/usr/bin/env python3
"""
Extract time segment from full video for social media clips.
Uses FFmpeg for fast, high-quality video extraction.
"""

import argparse
import subprocess
import sys
from pathlib import Path

def extract_clip(input_path, start_seconds, duration_seconds, output_path):
    """
    Extract a clip from video using FFmpeg.
    
    Args:
        input_path: Path to source video
        start_seconds: Start time in seconds
        duration_seconds: Clip duration in seconds
        output_path: Output file path
    """
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-ss', str(start_seconds),
        '-t', str(duration_seconds),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-preset', 'medium',
        '-crf', '23',
        '-y',  # Overwrite output
        str(output_path)
    ]
    
    print(f"🎬 Extracting clip from {start_seconds}s for {duration_seconds}s...")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ Clip saved to {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg error: {e.stderr}")
        return False

def timestamp_to_seconds(timestamp):
    """Convert MM:SS or HH:MM:SS to seconds."""
    parts = timestamp.split(':')
    if len(parts) == 2:  # MM:SS
        return int(parts[0]) * 60 + int(parts[1])
    elif len(parts) == 3:  # HH:MM:SS
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    else:
        raise ValueError(f"Invalid timestamp format: {timestamp}")

def main():
    parser = argparse.ArgumentParser(description="Extract video clip segment")
    parser.add_argument("--input", required=True, help="Input video file")
    parser.add_argument("--start", required=True, help="Start time (seconds or MM:SS)")
    parser.add_argument("--duration", required=True, help="Duration (seconds or MM:SS)")
    parser.add_argument("--output", required=True, help="Output file path")
    
    args = parser.parse_args()
    
    # Convert timestamps to seconds if needed
    try:
        start = int(args.start)
    except ValueError:
        start = timestamp_to_seconds(args.start)
    
    try:
        duration = int(args.duration)
    except ValueError:
        duration = timestamp_to_seconds(args.duration)
    
    # Validate input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ Input file not found: {input_path}")
        sys.exit(1)
    
    # Extract clip
    success = extract_clip(input_path, start, duration, args.output)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
