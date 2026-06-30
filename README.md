# Velvet Horizon - Music Band & Masterclass Platform

Welcome to the interactive website and learning hub for **Velvet Horizon**, featuring Julian Vance. This fully responsive web application is a bespoke portal for fans and aspiring producers alike. It blends a rich fan experience (including tour schedules, merchandise shopping, and interactive discography) with an advanced educational masterclass platform.

---

## 🌟 Key Features

### 1. 🎤 Tour & Booking
- **Global Concert Schedule**: View tour dates filtered by region (USA, Europe, Japan) and by month.
- **Ticket Booking System**: Interactive checkout screen to select quantity, choose ticket tier (GA, VIP, Backstage Pass), and process simulated payments.
- **Authentication Gated**: Guests are prompted to log in before purchasing tickets to ensure secure bookings.

### 2. 🎛️ Interactive Lesson & Masterclass Workspace
- **Private Tutor Booking**: Choose professional mentors (like Julian Vance himself) to schedule lessons with custom topics and durations.
- **Guided Tutorials**: Study comprehensive masterclass modules complete with simulated video playback progression, custom notes, and module chapters.
- **Interactive Synthesizer Lab**: A live, web-audio powered synthesizer playground that lets users experiment with custom waveforms (Sine, Square, Sawtooth), frequency filters, resonance peaks, and lowpass damping.
- **Authentication Gated**: Requires user login to book private sessions or watch/study premium masterclass courses.

### 3. 💿 Immersive Discography
- **Audio Catalog**: Explore Velvet Horizon's premium vinyl releases and stream previews with an integrated player.
- **Album Trivia Quizzes**: Interactive, multi-step gamified quizzes based on album background stories and music trivia, with instantaneous scoring.

### 4. 👕 Merch Store
- **Apparel & Accessories**: Dynamic product catalog displaying premium band merchandise, size/color selectors, and real-time inventory labels.
- **Integrated Shopping Cart**: Add items, adjust quantities, view subtotal updates instantly, and checkout seamlessly.

### 5. 🤖 Gemini-Powered Chat Assistant
- **AI Band Assistant**: Interactive chatbot sidebar ready to answer fan questions about Velvet Horizon's gear, music style, tour dates, and booking instructions.

---

## 🛠️ Technical Stack

- **Frontend Framework**: [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/) for ultra-fast, optimized client builds
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fluid, utility-first designs
- **Animations**: `motion` for polished page transitions and interactive state responses
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, uniform vector icons
- **State Management**: Built-in React Hooks (`useState`, `useEffect`, `useRef`, `useContext`) managing reactive workflows across modules

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone or extract the project files.
2. Open your terminal in the project's root directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running in Development
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Building for Production
Build the optimized static bundle:
```bash
npm run build
```
This produces production-ready static assets in the `dist/` directory.

---

## 🔒 Security & User Experience Design

- **Gated Booking Workflows**: Both the **Tour Tickets checkout** and **Masterclass booking/tutorials** are locked behind a smart auth guard. When an unauthenticated visitor attempts to book, they are greeted with a polite alert guiding them to sign in and automatically redirected to the Login tab.
- **Interactive Web Audio**: The Synthesizer Lab uses the native browser Web Audio API to produce real analog-style wave generation completely client-side.
