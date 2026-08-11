<div align="center">

# 🚀 Drop Tower Telemetry Lab

### Interactive 3D Physics Simulation

Explore free fall, gravitational acceleration, apparent weightlessness, and magnetic eddy-current braking through an interactive simulated drop-tower experiment.

<br />

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

<p>
  <a href="https://drop-tower-telemetry-lab.vercel.app"><strong>🔴 Live Demo</strong></a>
  &nbsp;•&nbsp;
  <a href="https://github.com/Niazul11/drop-tower-telemetry-lab"><strong>GitHub Repository</strong></a>
</p>

<br />

<a href="https://drop-tower-telemetry-lab.vercel.app">
  <img src="https://raw.githubusercontent.com/Niazul11/drop-tower-telemetry-lab/main/Screenshots/1.png" alt="Drop Tower Telemetry Lab Preview" width="100%" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
</a>

</div>

---

## 📖 Overview

**Drop Tower Telemetry Lab** is an interactive browser-based 3D physics simulation built around a virtual drop-tower experiment.

Users can select a drop height and gravitational environment, observe the capsule during free fall and magnetic braking, and analyze the resulting simulation data through telemetry and charts.

The application combines interactive 3D visualization, physics simulation, telemetry monitoring, and responsive interface design into a single interactive physics experience.

---

## ✨ Features

### 🧊 3D Simulation
- Interactive Three.js/WebGL drop-tower environment
- 3D tower and capsule visualization
- Free-fall motion
- Magnetic eddy-current braking visualization
- Interactive camera controls

### ⚙️ Experiment Configuration
- Configurable drop height
- Earth, Moon, Mars, and Jupiter gravity environments
- Gravity-dependent simulation behavior
- Experiment parameter preview
- Countdown and release sequence

### 📊 Telemetry & Results
- Altitude and velocity tracking
- Acceleration & G-force visualization
- Simulation time and telemetry charts
- Fall duration and maximum velocity
- Peak G-force & gravity environment comparison

### 🎨 User Experience
- Responsive mobile, tablet, laptop, and desktop layouts
- Dark mode, light mode, and system theme preference
- High-contrast mode & reduced-motion support
- Touch-friendly controls
- Interactive sound feedback

---

## 🪐 Gravity Environments

The simulation supports multiple gravitational environments to demonstrate how gravitational acceleration affects the simulated drop.

| Environment | Gravitational Acceleration | Relative Gravity |
|:-----------:|---------------------------:|-----------------:|
| 🌍 **Earth** | 9.81 m/s² | 1.00 g |
| 🌙 **Moon** | 1.62 m/s² | 0.16 g |
| 🔴 **Mars** | 3.72 m/s² | 0.38 g |
| 🟠 **Jupiter** | 24.79 m/s² | 2.53 g |

---

## 🔄 Experiment Flow

```text
Select Drop Height
        ↓
Select Gravity Environment
        ↓
Review Parameters
        ↓
Countdown
        ↓
Release
        ↓
Free Fall
        ↓
Magnetic Braking
        ↓
Telemetry Analysis
        ↓
Experiment Results
```

---

## 🔬 Physics

### Free Fall
After release, the capsule accelerates according to the gravitational acceleration of the selected environment.

### Apparent Weightlessness
During free fall, the capsule and its contents accelerate together under gravity, producing the condition commonly described as apparent weightlessness.

### Magnetic Eddy-Current Braking
Near the bottom of the tower, the simulation represents non-contact magnetic braking using eddy-current effects to decelerate the capsule.

---

## 📸 Screenshots

<div align="center">

### Interface & Simulation

  <img src="https://raw.githubusercontent.com/Niazul11/drop-tower-telemetry-lab/main/Screenshots/2.png" alt="Height and Gravity Selection" width="49%" style="border-radius: 8px;">
  <img src="https://raw.githubusercontent.com/Niazul11/drop-tower-telemetry-lab/main/Screenshots/3.png" alt="Live 3D Simulation" width="49%" style="border-radius: 8px;">

<br><br>

  <img src="https://raw.githubusercontent.com/Niazul11/drop-tower-telemetry-lab/main/Screenshots/4.png" alt="Telemetry Dashboard" width="49%" style="border-radius: 8px;">
  <img src="https://raw.githubusercontent.com/Niazul11/drop-tower-telemetry-lab/main/Screenshots/5.png" alt="Experiment Results" width="49%" style="border-radius: 8px;">
</div>

<br>

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React** | User interface |
| **TypeScript** | Type-safe development |
| **Three.js** | 3D/WebGL visualization |
| **Vite** | Development and production tooling |
| **Tailwind CSS** | Responsive UI styling |
| **Recharts** | Telemetry visualization |
| **Lucide React** | Interface icons |

---

## 📁 Project Structure

```text
drop-tower-telemetry-lab/
│
├── assets/
├── Screenshots/
│   ├── 1.png
│   ├── 2.png
│   ├── 3.png
│   ├── 4.png
│   └── 5.png
│
├── src/
│   ├── components/
│   │   ├── LandingScreen.tsx
│   │   ├── HeightSelectionScreen.tsx
│   │   ├── CountdownScreen.tsx
│   │   ├── LiveSimulationScreen.tsx
│   │   ├── TelemetryDashboardScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── ThreeTowerCanvas.tsx
│   │
│   ├── lib/
│   │   ├── physics.ts
│   │   └── sound.ts
│   │
│   ├── App.tsx
│   └── index.css
│
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Niazul11/drop-tower-telemetry-lab.git](https://github.com/Niazul11/drop-tower-telemetry-lab.git)
   ```

2. **Navigate to the project directory:**
   ```bash
   cd drop-tower-telemetry-lab
   ```

3. **Install the dependencies:**
   ```bash
   npm install
   ```

### Run Locally

Start the development server:
```bash
npm run dev
```

---

## ☁️ Deployment

The application is deployed with Vercel.

**Live Demo:**  
[https://drop-tower-telemetry-lab.vercel.app](https://drop-tower-telemetry-lab.vercel.app)
