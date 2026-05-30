export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
};

export const getActivityLabel = (level) => {
  const levels = {
    sedentary: 'Sedentary (little to no exercise)',
    'lightly active': 'Lightly Active (light exercise/sports 1-3 days/week)',
    'moderately active': 'Moderately Active (moderate exercise/sports 3-5 days/week)',
    'very active': 'Very Active (hard exercise/sports 6-7 days a week)',
    'extra active': 'Extra Active (very hard exercise/sports & physical job or 2x training)'
  };
  return levels[level] || level;
};
