# 🎯 Hands Prediction Score Calculator

A clean, mobile-first web application for tracking predictions and scores during live hands prediction card games (Saudi rules). This app is designed for 4 players and helps calculate scores based on hand predictions.

## 🎮 Game Rules

### Scoring System
- **Exact Prediction** ✅: 10 × prediction points
  - Example: Predicted 5 hands, got 5 → +50 points
- **Missed Prediction** ❌: minus 10 × predicted points
  - Example: Predicted 3 hands, got 2 → -30 points
- **Over Prediction** ➕: 10 × prediction + (1 point for every extra hand)
  - Example: Predicted 4 hands, got 7 → 40 + 3 = 43 points

### Target Scores
Choose from: 250, 300, 350, 500, 750, or 1000 points

## 🚀 Features

- **Player Setup**: Enter 4 player names and select target score
- **Live Score Tracking**: Real-time score updates after each round
- **Hands Input**: Enter predictions for each player (0-13 hands)
- **Result Selection**: Three-button system for results:
  - ✅ Exact match
  - ❌ Missed prediction
  - ➕ Over prediction (with modal for actual result)
- **Winner Detection**: Automatic winner highlighting when target score is reached
- **Game Controls**: Undo last round, complete round, and restart game
- **Mobile-First Design**: Optimized for mobile screens
- **Responsive Layout**: Works on all device sizes

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **CSS3** with mobile-first responsive design
- **No backend required** - all data stored in memory
- **Ready for deployment** on Vercel, Netlify, or any static hosting

## 📱 Mobile-First Design

The app is specifically designed for mobile use with:
- Large, touch-friendly buttons
- Intuitive layout optimized for small screens
- Clean, minimal interface with low visual noise
- Responsive grid layouts that adapt to screen size

## 🎨 Color Scheme

- **Green** (#27ae60): Success/exact predictions
- **Red** (#e74c3c): Failed predictions
- **Blue** (#3498db): Over predictions and primary actions
- **Neutral** (#2c3e50): Text and UI elements

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd estimation-score-calculator
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `build` folder, ready for deployment.

## 📋 How to Use

1. **Start Game**: Enter 4 player names and select target score
2. **Enter Hands Predictions**: For each round, enter how many hands each player predicts
3. **Record Results**: Use the three buttons to record actual results:
   - ✅ Green: Player got exactly what they predicted
   - ❌ Red: Player missed their prediction
   - ➕ Blue: Player got more than predicted (enter actual number)
4. **Complete Round**: Click "Complete Round" to save and move to next round
5. **Track Progress**: Watch live scores update and see who reaches the target first

## 🎯 Game Flow

1. **Setup Phase**: Enter player names and target score
2. **Prediction Phase**: Each player enters their hands prediction
3. **Result Phase**: Record actual results using the three-button system
4. **Completion**: Complete the round to update scores
5. **Repeat**: Continue until someone reaches the target score

## 🔧 Customization

The app is built with clean, modular code that's easy to customize:

- **Colors**: Modify CSS variables in component files
- **Scoring**: Adjust scoring logic in `utils/scoreCalculator.ts`
- **Target Scores**: Add/remove options in `components/PlayerEntry.tsx`
- **Styling**: Update CSS files for different themes

## 📦 Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify
3. Or connect to GitHub for automatic deployments

### Other Platforms
The app works on any static hosting platform that supports React apps.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the app.

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy your Hands Prediction games! 🎯**
