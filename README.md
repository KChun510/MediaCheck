# MediaCheck

**MediaCheck** is a tool that uses Google Gemini to analyze video content for quality and compliance, ensuring it meets guidelines and is free from errors before publishing.

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

1. Open `mediaCheck.ts` in your preferred code editor.

2. Edit the string parameters inside the `input` object:
   - `filePath`: Specify the path to the video file you want to check (e.g., `'path/to/video.mp4'`).
   - `invalidParam`: Optionally set any additional parameters (this has a default value if not provided).




