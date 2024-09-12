# WPM Tester

A web application for testing and improving typing speed, built with the
[Epic Stack](https://github.com/epicweb-dev/epic-stack) by Kent C. Dodds.

**Try it out**: [WPM Tester Live Site](https://wpm-tester.morgvanny.com)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Introduction

WPM Tester is a modern web application built with the Epic Stack, which provides
a solid foundation for teams to hit the ground running on their web
applications. It allows users to test their typing speed, track their progress
over time, and compete with others.

For more information on the Epic Stack, watch
[Kent's introduction video](https://remix.run/resources/epic-stack) or read the
[announcement post](https://kentcdodds.com/blog/introducing-the-epic-stack).

## Features

- Typing speed tests
- User authentication (including GitHub OAuth)
- Performance tracking and statistics
- Responsive design

## Technologies Used

This project leverages the Epic Stack, which includes:

- [Remix](https://remix.run/)
- [React](https://reactjs.org/)
- [Prisma](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Vite](https://vitejs.dev/)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/wpm-test.git
   cd wpm-test
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up the database:

   ```
   pnpm run setup
   ```

4. Start the development server:
   ```
   pnpm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000` (or the port
   specified in your configuration).
2. Create an account or log in with GitHub.
3. Start a typing test to measure your WPM (Words Per Minute) and accuracy.
4. View your statistics and track your progress over time.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- [Epic Stack](https://github.com/epicweb-dev/epic-stack) by Kent C. Dodds for
  providing the foundational structure and best practices
- [Remix](https://remix.run/) for the web framework
- [Prisma](https://www.prisma.io/) for the database ORM
- [Tailwind CSS](https://tailwindcss.com/) for the styling
- [GitHub](https://github.com/) for OAuth integration

---
