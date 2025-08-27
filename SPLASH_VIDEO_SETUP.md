# Splash Video Setup Instructions

## Current Status
⚠️ **CRITICAL**: The app requires a `splash_video.mp4` file to compile and run properly.

## Required File
- **Location**: `android/app/src/main/res/raw/splash_video.mp4`
- **Format**: MP4 video file
- **Duration**: 3-5 seconds recommended
- **Resolution**: 1080x1920 (portrait) or 1920x1080 (landscape)
- **Codec**: H.264
- **File size**: < 5MB

## How to Add the Video

### Option 1: Create a Simple Video
1. Use any video editing software (e.g., OpenShot, DaVinci Resolve)
2. Create a 3-5 second video with your app branding
3. Export as MP4 with H.264 codec
4. Place in `android/app/src/main/res/raw/splash_video.mp4`

### Option 2: Use a Placeholder Video
1. Download a simple animated logo or text video
2. Ensure it meets the specifications above
3. Rename to `splash_video.mp4`
4. Place in the raw resources directory

### Option 3: Convert Existing Video
1. Use FFmpeg to convert any video:
   ```bash
   ffmpeg -i input.mp4 -vf "scale=1080:1920" -c:v libx264 -crf 23 -preset fast -t 5 splash_video.mp4
   ```

## Fallback Implementation
The app now includes a fallback text-based splash screen that will display if the video fails to load, preventing compilation errors.

## Testing
After adding the video file:
1. Clean and rebuild the project
2. Test on both debug and release builds
3. Verify the splash screen displays correctly

## Notes
- The video will be automatically muted for better UX
- The splash screen will auto-finish after video completion or timeout
- Users can skip the splash by tapping if needed