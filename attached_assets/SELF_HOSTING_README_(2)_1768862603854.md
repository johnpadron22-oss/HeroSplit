# Fictional Physique Finder - Self-Hosting Guide

## Complete Production-Ready Export

This is a complete, production-ready Expo app that you can self-host privately.

---

## 📋 Project Structure

```
fictional-physique-finder/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx             # Browse characters screen
│   │   ├── build.tsx             # Custom workout builder (Pro)
│   │   ├── villains.tsx          # Villains workouts (Pro)
│   │   └── profile.tsx           # User profile & settings
│   ├── auth/
│   │   ├── login.tsx             # Email/password login
│   │   ├── signup.tsx            # User registration
│   │   ├── callback.tsx          # OAuth/magic link callback
│   │   ├── magic-link.tsx        # Passwordless login
│   │   └── reset-password.tsx   # Password recovery
│   ├── character/
│   │   └── [slug].tsx            # Character workout details
│   └── _layout.tsx               # Root layout with providers
├── components/
│   └── mobile/
│       ├── CharacterCard.tsx     # Character grid card
│       ├── FilterChips.tsx       # Filter pill components
│       └── PaywallModal.tsx      # Subscription paywall
├── lib/
│   ├── auth/
│   │   └── AuthProvider.tsx      # Auth context & hooks
│   ├── purchases/
│   │   └── PurchasesProvider.tsx # RevenueCat subscriptions
│   ├── supabase/
│   │   └── client.ts             # Supabase singleton client
│   ├── data.ts                   # Hero characters data
│   ├── villains-data.ts          # Villain characters data
│   ├── generator.ts              # Workout generator logic
│   ├── storage.ts                # Database operations
│   └── types.ts                  # TypeScript interfaces
├── assets/                       # Icons & splash screens
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── app.json                      # Expo static config
├── app.config.ts                 # Expo dynamic config
├── eas.json                      # EAS Build configuration
├── metro.config.js               # Metro bundler config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── SELF_HOSTING_README.md        # This file
```

---

## ✅ Required Files by Build Type

### All Builds (Web, Expo, Store)
- All `app/`, `components/`, `lib/` files
- `package.json`
- `metro.config.js`
- `tsconfig.json`
- `.gitignore`

### Web Demo Only
- `app.json` or `app.config.ts`
- No RevenueCat needed (web-guarded)
- No App Store assets needed

### EAS Preview/Store Builds
- `eas.json` (for EAS builds)
- `app.config.ts` (for dynamic config)
- `assets/` folder with icon.png, splash.png, adaptive-icon.png
- `.env` with required variables

---

## 🚀 Setup Instructions (macOS)

### 1. Install Prerequisites

```bash
# Install Node.js (if not installed)
brew install node

# Install Expo CLI globally
npm install -g expo-cli eas-cli
```

### 2. Clone & Install Dependencies

```bash
# Navigate to the expo-app directory
cd /path/to/fictional-physique-finder/expo-app

# Install dependencies
npm install
```

### 3. Configure Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and fill in your values
nano .env
```

**Required Environment Variables:**

```env
# REQUIRED: Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# OPTIONAL: RevenueCat (only for subscriptions/Pro features)
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_XXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_XXXXXXXXXXXXXXXXXXXXXXXX

# AUTO-GENERATED: EAS Project ID (set during eas build:configure)
EAS_PROJECT_ID=your-eas-project-id
```

### 4. Configure Supabase

#### A. Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### B. Set Redirect URLs in Supabase

1. Go to Authentication → URL Configuration
2. Add these redirect URLs:

**For Expo Go Development:**
```
exp+fictionalphysique://auth/callback
```

**For EAS Builds & Production:**
```
fictionalphysique://auth/callback
```

**For Web (if hosting):**
```
https://your-domain.com/auth/callback
```

#### C. Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_workouts table
CREATE TABLE saved_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  day_plans JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_workouts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Saved workouts policies
CREATE POLICY "Users can view own workouts"
  ON saved_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON saved_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON saved_workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON saved_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 💻 Running Locally

### Option 1: Expo Go (Quickest - No Build Required)

```bash
# Start the development server
npm start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app
```

**Limitations:**
- RevenueCat may not work (native module)
- Some deep links may not work perfectly
- Good for UI/UX development

### Option 2: iOS Simulator (Mac Only)

```bash
# Start on iOS simulator
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator set up

### Option 3: Android Emulator

```bash
# Start on Android emulator
npm run android
```

**Requirements:**
- Android Studio installed
- Android emulator configured

### Option 4: Web Demo (Self-Hosted)

```bash
# Start web version
npm run web

# Build for production
npx expo export:web

# Deploy the web-build/ folder to:
# - Vercel
# - Netlify
# - Any static host
```

**Web Limitations:**
- No RevenueCat (auto-disabled with Platform guards)
- All users treated as non-Pro
- No push notifications
- Paywall shows "Download mobile app" message

---

## 📱 Building for Production

### Setup EAS Build

```bash
# Login to Expo account
eas login

# Initialize EAS in your project
cd expo-app
eas build:configure

# This creates/updates:
# - eas.json
# - Sets EAS_PROJECT_ID in app.config.ts
```

### Build for iOS (Preview - No App Store)

```bash
# Internal distribution build (TestFlight alternative)
eas build --platform ios --profile preview

# After build completes, install via:
# - Download IPA
# - Install using Apple Configurator 2
# - Or scan QR code on device
```

### Build for Android (Preview - No Play Store)

```bash
# Internal distribution build
eas build --platform android --profile preview

# After build completes, install:
# - Download APK
# - Transfer to Android device
# - Install (enable "Install from unknown sources")
```

### Build for App Store & Play Store

```bash
# Production iOS build (for App Store)
eas build --platform ios --profile production

# Production Android build (for Play Store)
eas build --platform android --profile production
```

**Before Production Builds:**
1. Update version in `app.json` (bump version number)
2. Generate app icons (1024x1024 PNG)
3. Generate splash screen
4. Set up RevenueCat products
5. Configure EAS credentials

---

## 🛡️ Security Confirmations

### ✅ Supabase Client is a Singleton

**File:** `lib/supabase/client.ts`

```typescript
// ONE client created, exported, and reused everywhere
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// SINGLETON: Only one instance created
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mobile-only (not web)
  },
})
```

**Imported everywhere as:**
```typescript
import { supabase } from "@/lib/supabase/client"
```

**No duplicate clients anywhere in the codebase.**

---

### ✅ RevenueCat is Web-Safe

**File:** `lib/purchases/PurchasesProvider.tsx`

```typescript
import { Platform } from "react-native"

// RevenueCat is ONLY imported on native platforms
const Purchases = Platform.OS !== "web" 
  ? require("react-native-purchases").default 
  : null

// All RevenueCat calls are guarded:
if (Platform.OS !== "web" && Purchases) {
  await Purchases.configure({ apiKey: ... })
}
```

**On web:**
- RevenueCat never initializes
- `isPro` always returns `false`
- Paywall shows "Download mobile app" message
- No crashes or errors

---

### ✅ No v0-Specific Dependencies

This project uses only standard, open-source dependencies:

- **Expo** - React Native framework
- **Expo Router** - File-based routing
- **Supabase** - Backend & auth
- **RevenueCat** - Subscriptions (optional)
- **React Native** - UI framework

**No proprietary or v0-specific packages.**

---

## 🌐 Environment Variables Reference

### Where They're Used

| Variable | File | Purpose |
|----------|------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts:5` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts:6` | Supabase public API key |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | `lib/purchases/PurchasesProvider.tsx:39` | iOS subscription key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | `lib/purchases/PurchasesProvider.tsx:40` | Android subscription key |
| `EAS_PROJECT_ID` | `app.config.ts:78` | EAS Build project ID |

**How to verify they're loaded:**

```typescript
// In any screen, check:
console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL)
```

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found: @supabase/supabase-js"

**Fix:**
```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

---

### Issue: "Multiple GoTrueClient instances"

**Fix:** This is already fixed. Supabase client is a singleton. If you see this error:
1. Search for `createClient(` in your code
2. Ensure it only appears in `lib/supabase/client.ts`
3. All other files import: `import { supabase } from "@/lib/supabase/client"`

---

### Issue: Auth redirects don't work

**Check:**
1. Supabase redirect URLs are whitelisted (see Setup Instructions #4B)
2. `scheme: "fictionalphysique"` is in `app.json`
3. `detectSessionInUrl: false` in `lib/supabase/client.ts` (already set)

---

### Issue: RevenueCat crashes on web

**Fix:** Already fixed with Platform guards. If still crashing:
1. Check `lib/purchases/PurchasesProvider.tsx` has:
   ```typescript
   if (Platform.OS === "web") return null
   ```
2. Clear cache: `npx expo start -c`

---

### Issue: Pro features not working after purchase

**Fix:**
```bash
# Test restore purchases
# In app: Profile tab → Restore Purchases

# Or manually sync:
await refreshProfile() // in AuthProvider
```

---

### Issue: Build fails with "Missing icon.png"

**Create placeholder assets:**
```bash
# Create assets folder
mkdir -p assets

# Add placeholder 1024x1024 icon
# (Use any PNG image editor or online generator)
```

**Required assets:**
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (2048x2732)
- `assets/adaptive-icon.png` (1024x1024, Android only)
- `assets/favicon.png` (48x48, web only)

---

## 📦 Build Commands Checklist

### Local Development
```bash
# Install
cd expo-app
npm install

# Create .env
cp .env.example .env
# Edit .env with your Supabase keys

# Run locally
npm start           # Expo Go
npm run ios         # iOS Simulator
npm run android     # Android Emulator
npm run web         # Web browser
```

### EAS Preview Builds (No Store Submission)
```bash
# Login & configure
eas login
eas build:configure

# Build for testing
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Install builds on device for testing
# - iOS: Download IPA, install via Apple Configurator
# - Android: Download APK, install directly
```

### Production Store Builds
```bash
# Build for stores
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores (after build completes)
eas submit --platform ios
eas submit --platform android
```

---

## 🎯 Testing Checklist

### Authentication Testing
- [ ] Sign up with email/password
- [ ] Email verification link works
- [ ] Magic link sign-in works
- [ ] Password reset works
- [ ] Logout and session restore works

### Subscription Testing
- [ ] Paywall shows for non-Pro users
- [ ] Purchase monthly subscription (iOS sandbox)
- [ ] Purchase annual subscription (Android test)
- [ ] Restore purchases works
- [ ] Pro features unlock after purchase

### Features Testing
- [ ] Browse all characters
- [ ] View character workout details
- [ ] Filter by category and body part
- [ ] Build custom workout (Pro)
- [ ] View villain workouts (Pro)
- [ ] Save workout (requires login)

---

## 📄 License & Usage

This is a self-hosted export for private use. All code is production-ready and follows best practices:

- Singleton Supabase client
- Row Level Security enabled
- RevenueCat web-safe
- TypeScript strict mode
- Proper error handling
- Loading states everywhere

**You own this code. Self-host it anywhere.**

---

## 🆘 Need Help?

**Check these files for reference:**
- `LOCAL_TESTING_GUIDE.md` - Local development setup
- `EAS_BUILD_COMMANDS.md` - Build commands
- `SUPABASE_SINGLETON_VERIFICATION.md` - Singleton pattern audit
- `WEB_DEMO_GUIDE.md` - Web hosting guide

**Common commands:**
```bash
# Clear cache if things break
npx expo start -c

# Check TypeScript errors
npx tsc --noEmit

# Update dependencies
npm update

# Reset to fresh install
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Final Verification

Before deploying, verify:

- [ ] `.env` file exists with Supabase keys
- [ ] Supabase tables created (run SQL script)
- [ ] Supabase redirect URLs whitelisted
- [ ] `app.json` bundle IDs are unique
- [ ] Assets folder has icon.png and splash.png
- [ ] `npm start` works locally
- [ ] Authentication flow works end-to-end
- [ ] No TypeScript errors (`npx tsc --noEmit`)

**You're ready to ship!** 🚀
