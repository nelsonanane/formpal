# FitCal App

FitCal is a fitness application that provides real-time exercise analysis and feedback using video input. The app consists of a frontend built with React Native and a backend powered by Python.

## Table of Contents

- [Installation](#installation)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with FitCal, you need to set up both the frontend and backend components. Ensure you have the following prerequisites installed:

- Node.js and npm
- Python 3.12
- pip (Python package manager)
- Virtual environment tool (e.g., `venv`)

## Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

   This will launch the React Native development server. You can use an emulator or a physical device to run the app.

## Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python3.12 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   .\venv\Scripts\activate   # On Windows
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

   Ensure that `opencv-python` is included in your `requirements.txt` file.

4. **Run the backend server:**

   ```bash
   python main.py
   ```

   This will start the backend server, which listens for video analysis requests.

## Usage

1. **Open the app on your device** using the React Native development server.
2. **Record an exercise video** using the app's interface.
3. **Receive real-time feedback** on your exercise form through audio and text.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
