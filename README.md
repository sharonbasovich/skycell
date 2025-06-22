# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e6c6297e-2c16-4bc9-9002-38bcabf71d1c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e6c6297e-2c16-4bc9-9002-38bcabf71d1c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e6c6297e-2c16-4bc9-9002-38bcabf71d1c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# SkyCell Frontend

A modern React-based dashboard for visualizing high-altitude balloon telemetry data.

## Features

### 3D Trajectory Visualization

The dashboard now includes a real-time 3D trajectory visualization that uses actual flight data from the `data.csv` file. The visualization includes:

- **Real Flight Path**: Displays the actual trajectory based on latitude, longitude, and altitude data from the CSV
- **Interactive 3D View**: Rotate, zoom, and pan around the trajectory using mouse controls
- **Altitude Markers**: Visual markers showing altitude levels every 5km
- **Current Position**: Shows the balloon's current position with a glowing white sphere
- **Ground Plane**: A reference plane showing the flight area
- **Trajectory Statistics**: Real-time statistics including:
  - Maximum altitude reached
  - Total distance traveled
  - Number of data points
  - Current speed
  - Flight duration

### 🎬 **Animation Playback System**

The 3D visualization now includes a sophisticated animation system that recreates the actual flight:

- **Play Button**: Start the animation to watch the balloon move along the trajectory
- **Pause Button**: Pause the animation at any point
- **Reset Button**: Return to the beginning of the flight
- **100x Speed**: The animation runs 100 times faster than real-time for an engaging experience
- **Accurate Timing**: Uses the actual timestamps from the CSV data with speed multiplier
- **Smooth Interpolation**: The balloon smoothly moves between data points with realistic motion
- **Progress Bar**: Visual indicator showing the current position in the flight timeline
- **Time Display**: Shows the current time during playback
- **Speed Indicator**: Displays the current playback speed (100x real-time)
- **Automatic Pause**: Animation automatically stops when reaching the end of the flight data

### Data Sources

The 3D visualization uses data from:

- `public/data.csv` - Contains actual flight telemetry data with columns:
  - `datetime` - Timestamp for accurate animation timing
  - `lat` - Latitude coordinates
  - `lon` - Longitude coordinates
  - `alt` - Altitude in meters
  - `speed` - Ground speed in km/h
  - `ascent_rate` - Rate of ascent/descent
  - `temp` - Temperature readings
  - `batt` - Battery voltage

### Technical Implementation

- Built with React Three Fiber for 3D rendering
- Uses Three.js for 3D graphics
- Real-time data parsing from CSV
- Smooth animation using requestAnimationFrame
- Accurate timing based on actual flight timestamps with 100x speed multiplier
- Responsive design that works on desktop and mobile
- Smooth animations and transitions

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## How to Use the Animation

1. **Start Animation**: Click the play button (▶️) to begin the flight replay at 100x speed
2. **Pause/Resume**: Click the pause button (⏸️) to pause at any point
3. **Reset**: Click the reset button (🔄) to return to the beginning
4. **3D Navigation**: Use your mouse to:
   - **Left click + drag**: Rotate the view around the trajectory
   - **Scroll wheel**: Zoom in/out
   - **Right click + drag**: Pan the view
5. **Monitor Progress**: Watch the progress bar, time display, and speed indicator
6. **Duration Info**: Check the statistics panel to see both actual and playback durations

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── TrajectoryVisualization.tsx  # 3D trajectory component with 100x animation
│   └── ...
├── utils/
│   ├── csvDataUtils.ts                  # CSV parsing utilities
│   └── ...
└── pages/
    └── Dashboard.tsx                    # Main dashboard page
```

## Data Format

The CSV file should contain the following columns:

- `datetime` - Timestamp of the reading (used for animation timing)
- `lat` - Latitude in decimal degrees
- `lon` - Longitude in decimal degrees
- `alt` - Altitude in meters
- `speed` - Ground speed in km/h
- `ascent_rate` - Rate of ascent/descent in m/s
- `temp` - Temperature in Celsius
- `batt` - Battery voltage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
