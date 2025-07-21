# Audio Stream App - Next.js Full Stack

A real-time audio streaming application built with Next.js and Socket.io that allows users to share their tab audio with others. This is a unified full-stack application with conventional Next.js file structure.

## Features

- 🎵 Real-time tab audio streaming
- 📱 QR code sharing for easy joining
- 🔊 Live audio playback
- 📋 Room-based streaming sessions
- 📱 Responsive design
- 🎨 Modern UI with glassmorphism effects
- 🚀 Single application (frontend + backend combined)

## Tech Stack

- **Framework**: Next.js 14 with API routes
- **Real-time**: Socket.io via API routes (Vercel compatible)
- **Styling**: CSS3 with modern effects
- **Audio**: Web Audio API with MediaRecorder
- **Deployment**: Optimized for Vercel, Railway, Netlify

## Project Structure

```
audio-stream-app/
├── components/
│   ├── SenderComponent.js    # Streaming component
│   └── ReceiverComponent.js  # Listening component
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── index.js             # Home page
│   ├── sender.js            # Streaming page
│   └── receiver.js          # Listening page
├── styles/
│   └── globals.css          # Global styles
├── server.js                # Custom Next.js server with Socket.io
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd audio-stream-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`

2. **For Production**
   ```bash
   npm run build
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### For Streamers:
1. Click "Start Streaming"
2. Share the QR code or URL with others
3. Click "Start Tab Audio Streaming" 
4. Grant permission to share tab audio when prompted

### For Listeners:
1. Scan the QR code or visit the shared URL
2. Or click "Join Stream" and enter the room code manually
3. Audio will start playing automatically once the stream begins

## Key Differences from Separate Frontend/Backend

- **Single Server**: One command starts both Next.js and Socket.io
- **Same Port**: Everything runs on port 3000
- **Integrated**: Socket.io is embedded in the Next.js server
- **Simplified Deployment**: Deploy as a single application
- **Better Performance**: No cross-origin requests between frontend/backend

## Browser Compatibility

- Chrome (recommended for best audio support)
- Firefox
- Safari
- Edge

**Note**: Tab audio capture requires browser permission and works best in Chrome.

## Development

The application uses a custom Next.js server (`server.js`) that combines:
- Next.js for the web framework
- Socket.io for real-time communication
- Express server capabilities

### Custom Server Benefits:
- Real-time WebSocket connections
- Simplified deployment
- Single port usage
- Better development experience

## Troubleshooting

### Audio Not Working?
- Ensure you've granted permission for tab audio sharing
- Check that your browser supports `getDisplayMedia` with audio
- Make sure your device volume is turned up

### Connection Issues?
- Verify the server is running on port 3000
- Check that the port is available
- Ensure no firewall is blocking the connections

## Deployment

### Deploy to Vercel (Optimized Version)

This app is now optimized for Vercel deployment using Next.js API routes for Socket.io.

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Deploy with default settings
   - Your app will be live instantly!

3. **Vercel Configuration**
   The app includes `vercel.json` configuration for optimal Socket.io performance on Vercel.

### Alternative Deployment Options

#### Deploy to Railway (Also Great)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

#### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=out
   ```

### Deploy to Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Add buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Environment Variables

For production deployment, add these environment variables:
- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)

## Usage Instructions

### 🎵 For the Person Streaming Audio (Host):

1. **Start your audio source** (Spotify, Netflix, YouTube, etc.)
2. **Open the app** and click "Start Streaming Audio"
3. **Follow the clear instructions** shown on screen
4. **Click "Start Tab Audio Streaming"**
5. **Select the tab** playing your audio (Spotify, Netflix, etc.)
6. **⚠️ IMPORTANT: Check "Share tab audio" checkbox**
7. **Share the QR code or room code** with others

### 📱 For People Joining (Listeners):

**Method 1 - QR Code (Easiest for phones):**
1. Point your phone camera at the QR code
2. Tap the notification to open the link
3. Audio will start playing automatically

**Method 2 - Manual Entry:**
1. Click "Join Stream"
2. Enter the 6-digit room code
3. Click "Join Room"

**Method 3 - Direct Link:**
1. Open the shared URL directly in any browser

This app can be deployed to platforms that support custom Node.js servers:
- **Railway** (Recommended - great for Socket.io)
- **Heroku**
- **DigitalOcean App Platform**
- **VPS with Node.js**
- **Render.com**

**Note:** Vercel doesn't support custom servers in production, so use Railway or Heroku for deployment.

## License

This project is open source and available under the [MIT License](LICENSE).
