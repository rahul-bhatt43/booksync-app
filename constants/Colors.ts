const tintColorLight = '#2f95dc';
const tintColorDark = '#f59e0b'; // Primary orange/amber

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fafafa', // foreground: 60 9.1% 97.8%
    background: '#0a0908', // background: 20 14.3% 4.1%
    tint: tintColorDark,
    tabIconDefault: '#71717a',
    tabIconSelected: tintColorDark,
    card: '#0a0908',
    border: '#272421', // border: 12 6.5% 15.1%
    notification: '#f59e0b',
  },
};
