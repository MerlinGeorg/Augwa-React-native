import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const baseWidth = 375;  // Base width for iPhone X
const baseHeight = 812; // Base height for iPhone X

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

const moderateScale = (size, factor = 0.5) => size + ( scaleSize(size) - size ) * factor;

function scaleSize(size) {
    return Math.round(scale * size);
}

const calculatePercentageHeight = (percentage) => {
    return height * (percentage / 100);
  };

export { scaleSize, moderateScale, calculatePercentageHeight };
