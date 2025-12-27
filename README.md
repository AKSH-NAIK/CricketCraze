# CricketCraze

An interactive cricket trivia quiz application built with vanilla HTML, CSS, and JavaScript.

## Overview

CricketCraze is a browser-based quiz game that tests your knowledge of cricket facts, records, and history. The application features multiple difficulty levels, real-time scoring, timed questions, and a clean responsive interface with dark/light theme support.

## Live Demo

**[Play CricketCraze](https://aksh-naik.github.io/CricketCraze/)**

## Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard question sets
- **Timed Questions**: 10-second countdown per question
- **Real-time Scoring**: Instant feedback on correct/incorrect answers
- **Audio Feedback**: Web Audio API-powered sound effects
- **Theme Toggle**: Dark and light mode with preference persistence
- **Client-side Authentication**: Mock login/signup with session storage
- **Responsive Design**: Optimized for desktop and mobile devices
- **No Dependencies**: Pure HTML, CSS, and JavaScript

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Document structure |
| CSS3 | Styling, animations, dark mode |
| JavaScript (ES6+) | Game logic, audio, authentication |
| Web Audio API | Sound effects |
| Local Storage | Session and theme persistence |

## Project Structure

```
CricketCraze/
├── index.html        # Main HTML document
├── style.css         # Stylesheet with dark mode support
├── script.js         # Quiz game logic
├── auth.js           # Authentication and theme module
├── questions.json    # Question database
└── README.md
```

## Getting Started

### Prerequisites

A modern web browser (Chrome, Firefox, Safari, Edge).

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/AKSH-NAIK/CricketCraze.git
   cd CricketCraze
   ```

2. Serve the files using any static server:
   ```bash
   npx serve
   ```

3. Open `http://localhost:3000` in your browser.

Alternatively, open `index.html` directly in your browser.

## Configuration

### Adding Questions

Edit `questions.json` to add or modify questions. Each question follows this format:

```json
{
  "question": "Your question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Correct Option"
}
```

Questions are organized by difficulty: `easy`, `medium`, `hard`.

### Google Sign-In

To enable Google authentication, replace `YOUR_GOOGLE_CLIENT_ID` in `index.html` with your Google OAuth 2.0 client ID.

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

**Aksh Naik**  
GitHub: [github.com/AKSH-NAIK](https://github.com/AKSH-NAIK)
