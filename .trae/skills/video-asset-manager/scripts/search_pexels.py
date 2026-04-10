#!/usr/bin/env python3
"""
Search and download video clips from Pexels API based on scene plan.
"""

import json
import os
import sys
import argparse
import requests
from pathlib import Path

PEXELS_API_URL = "https://api.pexels.com/videos/search"

def search_pexels(query, api_key, per_page=5, orientation="landscape"):
    """Search Pexels for video clips matching query."""
    headers = {"Authorization": api_key}
    params = {
        "query": query,
        "per_page": per_page,
        "orientation": orientation
    }
    
    response = requests.get(PEXELS_API_URL, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def download_video(url, output_path):
    """Download video file from URL."""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def main():
    parser = argparse.ArgumentParser(description="Search and download Pexels clips")
    parser.add_argument("--scene-plan", required=True, help="Path to scene plan JSON")
    parser.add_argument("--output-dir", required=True, help="Output directory for clips")
    parser.add_argument("--api-key", required=True, help="Pexels API key")
    parser.add_argument("--top-n", type=int, default=2, help="Top N clips per scene")
    parser.add_argument("--orientation", default="landscape", choices=["landscape", "portrait", "square"])
    
    args = parser.parse_args()
    
    # Load scene plan
    with open(args.scene_plan, 'r') as f:
        scene_plan = json.load(f)
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    asset_manifest = {
        "projectName": scene_plan.get("song", {}).get("title", "Unknown"),
        "assets": []
    }
    
    # Process each scene
    for scene in scene_plan.get("scenes", []):
        scene_num = scene["sceneNumber"]
        keywords = scene.get("clipKeywords", [])
        
        if not keywords:
            print(f"⚠️  Scene {scene_num}: No keywords specified, skipping")
            continue
        
        # Search with combined keywords
        query = " ".join(keywords)
        print(f"🔍 Scene {scene_num}: Searching for '{query}'...")
        
        try:
            results = search_pexels(query, args.api_key, per_page=args.top_n, orientation=args.orientation)
            videos = results.get("videos", [])
            
            if not videos:
                print(f"❌ Scene {scene_num}: No results found")
                continue
            
            # Download top N clips
            for i, video in enumerate(videos[:args.top_n]):
                video_id = video["id"]
                video_files = video.get("video_files", [])
                
                # Find HD quality video file
                hd_file = next(
                    (vf for vf in video_files if vf.get("quality") in ["hd", "sd"]),
                    video_files[0] if video_files else None
                )
                
                if not hd_file:
                    print(f"⚠️  Scene {scene_num}: No suitable video file found")
                    continue
                
                # Download
                filename = f"scene-{scene_num:02d}-{i+1}-{'-'.join(keywords[:2])}.mp4"
                output_path = output_dir / filename
                
                print(f"⬇️  Downloading {filename}...")
                download_video(hd_file["link"], output_path)
                
                # Add to manifest
                asset_manifest["assets"].append({
                    "sceneNumber": scene_num,
                    "filename": filename,
                    "source": "pexels",
                    "pexelsId": video_id,
                    "duration": video.get("duration", 0),
                    "resolution": f"{video.get('width', 0)}x{video.get('height', 0)}",
                    "keywords": keywords
                })
                
                print(f"✅ Scene {scene_num}: Downloaded {filename}")
        
        except Exception as e:
            print(f"❌ Scene {scene_num}: Error - {str(e)}")
            continue
    
    # Save asset manifest
    manifest_path = output_dir / "asset-manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(asset_manifest, f, indent=2)
    
    print(f"\n✅ Complete! Manifest saved to {manifest_path}")
    print(f"📊 Downloaded {len(asset_manifest['assets'])} clips for {len(scene_plan.get('scenes', []))} scenes")

if __name__ == "__main__":
    main()
