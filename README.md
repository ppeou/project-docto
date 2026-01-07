# Project Docto

A Progressive Web App (PWA) for families to coordinate and manage healthcare for themselves or elderly parents. Family members can create shared healthcare itineraries, track appointments, manage prescriptions, and collaborate on care planning.

## Features

- ✅ **Healthcare Itineraries**: Create and manage healthcare plans for family members
- ✅ **Appointments**: Track doctor appointments with reminders
- ✅ **Prescriptions**: Manage medications and refill tracking
- ✅ **Doctor Notes**: Record important medical information
- ✅ **Family Sharing**: Share itineraries with family members
- ✅ **PWA Support**: Offline-capable, installable web app
- ✅ **Real-time Updates**: Live synchronization across devices

## Tech Stack

- **React 18+** with JavaScript (ES6+)
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** components (Radix UI + Tailwind)
- **React Router** for navigation
- **React Query** for server state management
- **Zustand** for global UI state
- **React Hook Form + Zod** for forms and validation
- **Firebase** (Authentication, Firestore, Hosting, Cloud Functions)

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Firebase project created

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Copy your Firebase config

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Update Firebase Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID.

### 5. Cloud Functions Setup (Optional)

If you want email/SMS notifications:

```bash
cd functions
npm install
```

#### Email Configuration (Choose One)

**Option 1: SMTP (Generic email server - Recommended)**
```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.password="your-app-password"
firebase functions:config:set smtp.secure="false"
```

Or create `functions/.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
```

**Option 2: Gmail (Simpler, but less flexible)**
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
```

**SMTP Server Examples:**
- Gmail: `smtp.gmail.com:587` (secure: false) or `:465` (secure: true)
- Outlook: `smtp-mail.outlook.com:587`
- Yahoo: `smtp.mail.yahoo.com:587`
- Custom: Use your email provider's SMTP settings

#### SMS Configuration (Choose One)

**Option 1: Textbelt (Free tier: 1 SMS/day, Paid: Unlimited)**
```bash
firebase functions:config:set textbelt.api_key="your-textbelt-api-key"
```

Get API key from: https://textbelt.com/
- Free tier: 1 SMS/day
- Paid: $10/month for unlimited

Or create `functions/.env` file:
```env
TEXTBELT_API_KEY=your-textbelt-api-key
```

**Option 2: Twilio (Paid service)**
```bash
firebase functions:config:set twilio.account_sid="your-sid"
firebase functions:config:set twilio.auth_token="your-token"
firebase functions:config:set twilio.phone_number="+1234567890"
```

**Local Development:**
Create `functions/.env` file with your credentials for local testing.

### 6. Firestore Rules

Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

### 7. Development

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000

### 8. Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### 9. Deploy

Deploy to Firebase Hosting:

```bash
firebase deploy
```

Or deploy separately:

```bash
# Deploy hosting only
npm run deploy:hosting

# Deploy functions only
npm run deploy:functions
```

## Project Structure

```
project-docto/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Base UI components (shadcn/ui)
│   │   ├── shared/     # Shared components
│   │   └── features/   # Feature-specific components
│   ├── pages/          # Page components (routes)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Firebase services (auth, firestore)
│   ├── store/          # Zustand stores
│   ├── lib/            # Utilities and helpers
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── functions/          # Cloud Functions
├── specs/              # Specifications and documentation
└── public/             # Static assets
```

## Development Guidelines

- **KISS**: Keep it simple, intuitive interface
- **DRY**: Reusable components and utilities
- **SOLID**: Single responsibility components
- **YAGNI**: Build only what's needed

## License

MIT

