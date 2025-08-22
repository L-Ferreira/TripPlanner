# 🌍 Trip Planner

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, feature-rich trip planning application built with React, TypeScript, and Tailwind CSS. Plan your trips with detailed day-by-day itineraries, accommodation management, and seamless data synchronization.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [☁️ Google Drive Setup](#️-google-drive-setup)
- [📱 PWA Installation](#-pwa-installation)
- [📖 Usage Guide](#-usage-guide)
- [🛠️ Development](#️-development)
- [🔧 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🎯 **Core Trip Planning**
- **Complete CRUD Operations** - Add, edit, delete everything through an intuitive UI
- **Day-by-Day Itineraries** - Organize your trip with detailed daily plans
- **Place Management** - Add and manage places to visit with descriptions and images
- **Accommodation Tracking** - Manage hotel bookings with amenities and details
- **Image Galleries** - Add photos to capture your trip memories
- **Notes & Descriptions** - Add detailed notes for each day and place with markdown support

### 🌐 **Internationalization**
- **Multi-language Support** - English and Portuguese (Portugal)
- **Language Selector** - Easy language switching with flag icons
- **Localized Content** - All text, dates, and formats adapt to selected language
- **Persistent Language Choice** - Remembers your language preference

### ☁️ **Data Synchronization**
- **Google Drive Integration** - Sync your trip data across devices
- **Real-time Sync** - Automatic synchronization with conflict resolution
- **Offline Support** - Work without internet connection
- **Import/Export** - Backup and share your trip data as JSON files

### 📱 **Progressive Web App (PWA)**
- **Installable** - Add to home screen on mobile and desktop
- **Offline Functionality** - Works without internet connection
- **App-like Experience** - Standalone mode with no browser UI
- **Push Notifications Ready** - Framework for future notification features

### 🎨 **Modern UI/UX**
- **Responsive Design** - Optimized for all screen sizes
- **Beautiful Components** - Built with shadcn/ui for consistency
- **Dark/Light Mode Ready** - Framework for theme switching
- **Accessible** - WCAG compliant with proper ARIA labels
- **Mobile-First** - Touch-optimized interface

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.6.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trip-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174`

### Building for Production

```bash
npm run build
npm run preview
```

## ☁️ Google Drive Setup

### Prerequisites
- A Google Cloud Platform account
- Your trip planner application running locally or deployed

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to **APIs & Services** > **Library**
   - Search for "Google Drive API"
   - Click **Enable**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: "Trip Planner"
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users (your email address)

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - Development: `http://localhost:5174`
   - Production: `https://your-domain.com`
5. Copy the **Client ID** (you'll need this for environment variables)

### Step 4: Environment Variables

Create a `.env` file in the project root:

```env
# Google Drive Integration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5174

# For production deployment
# VITE_GOOGLE_REDIRECT_URI=https://your-domain.com
```

**Note:** Client Secret is not required for this integration as we use the implicit OAuth flow for security.

### Step 5: Test Integration

1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click **Connect to Google Drive** in the header
4. Complete the OAuth flow
5. Verify that your trip data syncs with Google Drive

### How It Works

- **Authentication**: Uses OAuth 2.0 implicit flow (no client secret required)
- **File Storage**: Trip data is stored as `trip-planner-data.json` in your Google Drive
- **Sync Strategy**: The app automatically syncs when you authenticate and checks for changes every 30 seconds
- **Conflict Resolution**: Smart merge strategies for handling conflicts
- **Privacy**: Data is stored in your personal Google Drive, not accessible to other users

### Troubleshooting

**"Authentication failed" Error**
- Verify your Client ID is correct
- Check that the redirect URI matches exactly (including http/https)
- Ensure the Google Drive API is enabled in your project

**"Popup blocked" Error**
- Allow popups for your application domain
- Try using a different browser or incognito mode

**"Not authenticated" Error**
- Clear your browser's localStorage and try logging in again
- Check that your OAuth credentials haven't expired

## 📱 PWA Installation

### PWA Features

✅ **Offline Access** - App works without internet connection  
✅ **App Installation** - Can be installed on mobile and desktop  
✅ **Push Notifications** - Ready for future notifications  
✅ **Responsive Design** - Optimized for all screen sizes  
✅ **App-like Experience** - Standalone mode, no browser UI  

### Installation Instructions

#### Mobile (Android)
1. Open the app in Chrome
2. Look for the "Install Trip Planner" popup at the bottom
3. Tap "Install" or use the browser menu → "Add to Home Screen"

#### Mobile (iOS)
1. Open the app in Safari
2. Tap the share button (📤) at the bottom
3. Select "Add to Home Screen"
4. Tap "Add" in the top right

#### Desktop
1. Look for install icon in address bar
2. Click "Install" to add to desktop

### Offline Functionality

The app works offline because:
- **Local Storage**: Trip data is saved locally
- **Service Worker**: Caches app files for offline access
- **Smart Syncing**: Syncs changes when connection is restored

### Troubleshooting PWA

**App not installing**
- Ensure HTTPS (except localhost)
- Check manifest in DevTools → Application → Manifest
- Verify service worker in DevTools → Application → Service Workers

**Offline not working**
- Check service worker registration
- Verify caching strategies in `vite.config.ts`
- Test with Chrome DevTools → Application → Service Workers

## 📖 Usage Guide

### 🎯 **Getting Started**

1. **Create Your Trip**
   - Click "Edit Trip" to set trip name, description, and dates
   - Add your first day using the "Add Day" button

2. **Plan Your Days**
   - Add regions/locations for each day
   - Include drive times and distances
   - Add Google Maps embed URLs for navigation

3. **Add Places to Visit**
   - Click "Add Place" in any day section
   - Include descriptions, website URLs, and images
   - Add Google Maps links for easy navigation

4. **Manage Accommodation**
   - Edit accommodation details for each day
   - Add hotel websites and Google Maps links
   - Select amenities from a comprehensive checklist

### 🌐 **Language Settings**

- **Switch Languages**: Use the flag icon in the header
- **Default Language**: App defaults to Portuguese
- **Persistent Choice**: Your language preference is saved

### 📱 **Mobile Experience**

- **Responsive Layout** - Optimized for all screen sizes
- **Touch Gestures** - Swipe and tap optimized interface
- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen for app-like experience
- **Safe Areas** - Respects device notches and system UI

### 🌐 **Browser Support**

- **Chrome** 88+ (Recommended)
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run type-check      # Run TypeScript checks
npm run check-all       # Run all quality checks
```

### Project Structure

```
src/
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   ├── TripPlanner.tsx        # Main application component
│   ├── TripHeader.tsx         # Header with actions and language selector
│   ├── GoogleDriveAuth.tsx    # Google Drive integration
│   ├── PWAInstallPrompt.tsx   # PWA installation prompts
│   └── [Other components]     # Modals, cards, etc.
├── contexts/                  # React contexts
│   └── SyncContext.tsx        # Data synchronization context
├── hooks/                     # Custom React hooks
│   └── useTripData.ts         # Trip data management
├── lib/                       # Utility libraries
│   ├── utils.ts               # General utilities
│   └── amenities.ts           # Amenity definitions
├── locales/                   # Translation files
│   ├── en.json               # English translations
│   └── pt.json               # Portuguese translations
├── i18n.ts                   # Internationalization setup
└── App.tsx                   # Root application component
```

### Key Technologies

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Vite** - Fast build tool and development server
- **i18next** - Internationalization framework
- **PWA** - Progressive Web App capabilities
- **Google Drive API** - Cloud synchronization

## 🔧 Configuration

### PWA Configuration

The PWA is configured in `vite.config.ts` with:
- Service worker for offline functionality
- Manifest for app installation
- Icon generation and caching strategies

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure all tests pass
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for travelers who love to plan their adventures!** ✈️🗺️📝 