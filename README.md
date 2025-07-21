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

- **Framework**: Next.js 14 with custom server
- **Real-time**: Socket.io
- **Styling**: CSS3 with modern effects
- **Audio**: Web Audio API with MediaRecorder

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

This app can be deployed to platforms that support custom Node.js servers:
- Heroku
- Railway
- DigitalOcean App Platform
- VPS with Node.js

## License

This project is open source and available under the [MIT License](LICENSE).
