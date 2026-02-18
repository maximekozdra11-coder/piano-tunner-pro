# Piano Tuner Pro - Flutter Application

A professional-grade piano tuning mobile application built with Flutter/Dart.

## Features

### Core Functionality
- **Inharmonicity Measurement**: Measures the real inharmonicity of each individual piano
- **Adaptive Stretch Tuning**: Computes a Railsback-style stretch tuning curve specific to each instrument
- **Cents Deviation Cursor**: Visual tuning guidance with smooth, stable cents meter (±50 cents range)
- **Offline Operation**: Works completely offline, no internet required
- **Cross-Platform**: Runs on iOS and Android

### Technical Highlights
- **Audio Engine**: High-resolution FFT with Blackman-Harris windowing and zero-padding
- **Pitch Detection**: Hybrid YIN algorithm with FFT-based autocorrelation for sub-cent accuracy
- **Partial Analysis**: Detects up to 12 partials with SNR-based quality scoring
- **Noise Filtering**: Hammer attack detection and stable zone extraction
- **Mathematical Models**: Weighted least-squares inharmonicity estimation, cubic spline interpolation
- **Multiple Temperaments**: Equal, Pythagorean, Meantone, Werckmeister III, Kirnberger III, Vallotti
- **SQLite Database**: Persistent storage of piano profiles and tuning history
- **Smart Tuning Order**: Intelligent note sequence (A4 → temperament octave → expand by octaves)

## Architecture

The app follows a strict layered architecture:

```
lib/
├── audio_engine/       # Audio capture, FFT, pitch detection, partial analysis
├── math_engine/        # Inharmonicity, stretch tuning, temperaments, coherence
├── data/               # SQLite database and models
├── services/           # Tuning and measurement workflow orchestration
├── ui/                 # Screens and widgets
│   ├── screens/        # Home, measurement, tuning, profile screens
│   ├── widgets/        # Cents meter, displays, charts
│   └── theme.dart      # Professional dark theme
└── main.dart           # App entry point
```

## Getting Started

### Prerequisites
- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Android SDK (for Android) or Xcode (for iOS)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd piano-tunner-pro/flutter_app
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Usage

### 1. Measure a Piano
1. Tap "New Piano" on the home screen
2. Follow the guided measurement workflow
3. Play each reference note (A0-A7) when prompted
4. The app will analyze partials and calculate inharmonicity
5. Save the piano profile with a name

### 2. Tune the Piano
1. Select a piano from the home screen
2. Tap "Start Tuning"
3. The app suggests notes in optimal tuning order
4. For each note:
   - Play the note
   - Watch the cents meter for deviation
   - Adjust until the meter is centered (green zone)
   - Hold stable for 2 seconds for auto-validation
5. Progress through all 88 keys

### 3. View Piano Profile
- Tap the info icon on any piano card
- View inharmonicity data and tuning history
- Edit or delete the profile

## Key Components

### Audio Processing
- **Sample Rate**: 44100 Hz (configurable to 48000 Hz)
- **Buffer Size**: 8192 samples (configurable)
- **FFT Size**: 32768 (4x zero-padding)
- **Frequency Resolution**: < 0.1 cent accuracy
- **Pitch Range**: A0 (27.5 Hz) to C8 (4186 Hz)

### Cents Meter
- **Range**: ±50 cents
- **In-Tune Zone**: ±2 cents (green)
- **Close Zone**: ±5-15 cents (orange)
- **Far Zone**: > 15 cents (red)
- **Refresh Rate**: 30-60 FPS
- **Smoothing**: Exponential moving average (α = 0.2)

### Inharmonicity Model
- **Formula**: f_n = n * f0 * sqrt(1 + B * n²)
- **Estimation**: Weighted least-squares with outlier rejection
- **Valid Range**: 0.00001 < B < 0.01
- **Interpolation**: Cubic spline (4+ points) or linear (2-3 points)

## Performance

- **Pitch Detection Latency**: < 100 ms
- **Memory Usage**: < 100 MB
- **Supported Devices**: Mid-range smartphones (2020+)
- **No Heavy UI Thread Computation**: All processing uses isolates when needed

## Dependencies

```yaml
dependencies:
  flutter: sdk
  sqflite: ^2.3.0          # SQLite database
  path_provider: ^2.1.0    # File system paths
  permission_handler: ^11.0.0  # Microphone permissions
  record: ^5.0.0           # Audio capture
  fl_chart: ^0.65.0        # Charts and graphs
  provider: ^6.1.0         # State management
  fftea: ^1.0.1            # FFT library
  intl: ^0.18.1            # Internationalization
```

## Future Enhancements

- [ ] Calibration screen for microphone frequency response
- [ ] Expert mode with beat rate visualization
- [ ] Tuning heatmap showing global coherence
- [ ] Export/import piano profiles
- [ ] Cloud backup of tuning data
- [ ] Multiple language support
- [ ] iPad/tablet optimized layouts

## License

Copyright © 2024. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team.
