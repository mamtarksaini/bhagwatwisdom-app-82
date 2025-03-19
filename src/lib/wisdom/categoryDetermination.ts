
// Function to determine response category based on the question
export const determineResponseCategory = (question: string): string => {
  question = question.toLowerCase();
  
  if (question.includes('relationship') || question.includes('marriage') || question.includes('partner') || 
      question.includes('love') || question.includes('family') || question.includes('friend')) {
    return 'relationships';
  } else if (question.includes('job') || question.includes('career') || question.includes('work') || 
             question.includes('business') || question.includes('profession')) {
    return 'career';
  } else if (question.includes('health') || question.includes('illness') || question.includes('sick') || 
             question.includes('body') || question.includes('disease') || question.includes('pain')) {
    return 'health';
  } else if (question.includes('spiritual') || question.includes('meditation') || question.includes('soul') || 
             question.includes('enlightenment') || question.includes('god') || question.includes('divine')) {
    return 'spirituality';
  } else if (question.includes('worry') || question.includes('anxiety') || question.includes('stress') || 
             question.includes('fear') || question.includes('nervous') || question.includes('panic') ||
             question.includes('tension') || question.includes('tensed')) {
    return 'anxiety';
  } else if (question.includes('meaning') || question.includes('purpose') || question.includes('direction') ||
             question.includes('lost') || question.includes('confused') || question.includes('clarity')) {
    return 'purpose';
  } else if (question.includes('happy') || question.includes('happiness') || question.includes('joy') ||
             question.includes('content') || question.includes('satisfaction') || question.includes('fulfillment')) {
    return 'happiness';
  }
  
  return 'default';
};
