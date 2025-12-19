# Smart Irrigation System

An advanced IoT-based irrigation system capable of variable rate irrigation with zone control. This project provides a dashboard to monitor environmental conditions, control irrigation valves manually or automatically, and view historical data.

## Features

-   **Dashboard**: Real-time monitoring of temperature, humidity, and active zones.
-   **Zone Control**: Monitor and control individual irrigation zones (soil moisture, valve status).
-   **Modes**:
    -   **Auto Mode**: Valves controlled automatically based on moisture thresholds.
    -   **Manual Mode**: User can manually toggle valves on/off.
-   **Weather**: View weather conditions (placeholder/implementation for future).
-   **History**: Historical data of irrigation events and sensor readings.
-   **Settings**: Configure system settings and preferences.

## Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd irrigate-spark
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    bun install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:8080` (or the port shown in your terminal).

### Building for Production

To build the application for production:

```bash
npm run build
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.
