# MediaCheck (Benchmark Branch)

**MediaCheck** is a tool that uses Google Gemini to analyze video content for quality and compliance, ensuring it meets guidelines and is free from errors before publishing.

## Benchmark Results
   1/21/25
   ```js
   [
     { res: 'true', truth: 'Good' },
     { res: 'false', truth: 'Bad' },
                  ...
                  ...
     { res: 'false', truth: 'Good' },
     { res: 'false', truth: 'Bad' },
     { res: 'false', truth: 'Bad' }
   ]
   correct: 78, incorrect: 22
   Accuracy: 0.78


## Dependencies

- `dotenv`: Loads environment variables from a `.env` file.
- `@google/generative-ai/server`: For managing files with Google Generative AI.
- `@google/generative-ai`: To interact with Google’s Generative AI services.

## Installation

To use **MediaCheck**, make sure you have the following dependencies installed:

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/media-check.git
   cd media-check

## Usage
1. Place your Gemini API key in a .env file, at the root.
   - [Get Key Here](https://aistudio.google.com/app/apikey)

2. Open `mediaCheck.ts` in your preferred code editor.

3. Edit the string parameters inside the `input` object:
   - `filePath`: Specify the path to the video file you want to check (e.g., `'path/to/video.mp4'`).
   - `invalidParam`: Optionally set any additional parameters (this has a default value if not provided).




