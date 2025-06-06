# NetPulse React

A comprehensive network monitoring and testing application built with React and TypeScript. NetPulse provides real-time network performance analysis, speed testing, latency monitoring, and connection quality assessment.

## Features

- **Network Speed Testing**: Download and upload speed measurements
- **Latency Monitoring**: Real-time ping and jitter analysis
- **Connection Quality**: Comprehensive network quality scoring
- **Device Detection**: Automatic device and browser capability detection
- **Network Information**: ISP detection and connection type analysis
- **Responsive Design**: Mobile-first design with PWA capabilities
- **Real-time Charts**: Interactive performance visualization

## Tech Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Styling**: CSS3 with responsive design
- **Testing**: Jest and React Testing Library
- **Build Tool**: Create React App
- **Network APIs**: WebRTC, Network Information API, Performance API

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd netpulse-react
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── components/          # React components
│   ├── Charts/         # Chart components
│   ├── Layout/         # Layout components
│   └── Views/          # Page view components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # Network testing services
├── styles/             # CSS stylesheets
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Network Testing

The application includes several test files for network performance measurement:

- `public/test-files/1kb.bin` - Basic connectivity testing
- `public/test-files/10kb.bin` - Small file transfer testing
- `public/test-files/100kb.bin` - Medium file transfer testing

For production deployments requiring larger test files, consider generating them dynamically or using a CDN.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
