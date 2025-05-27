
interface AITaggingResponse {
  tags: string[];
  productSuggestion?: string;
}

export const suggestTags = async (caption: string): Promise<AITaggingResponse> => {
  console.log('Analyzing caption for tags:', caption);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockTags: AITaggingResponse = {
    tags: [],
    productSuggestion: undefined
  };
  
  const lowercaseCaption = caption.toLowerCase();
  
  // More comprehensive keyword matching
  if (lowercaseCaption.includes('tech') || lowercaseCaption.includes('gadget') || lowercaseCaption.includes('device') || 
      lowercaseCaption.includes('wireless') || lowercaseCaption.includes('charging') || lowercaseCaption.includes('phone')) {
    mockTags.tags.push('tech', 'gadgets', 'electronics');
    if (lowercaseCaption.includes('charging') || lowercaseCaption.includes('wireless')) {
      mockTags.productSuggestion = 'Wireless Charging Pad';
    }
  }
  
  if (lowercaseCaption.includes('fitness') || lowercaseCaption.includes('workout') || lowercaseCaption.includes('exercise') || 
      lowercaseCaption.includes('gym') || lowercaseCaption.includes('resistance') || lowercaseCaption.includes('bands')) {
    mockTags.tags.push('fitness', 'health', 'workout');
    if (lowercaseCaption.includes('resistance') || lowercaseCaption.includes('bands')) {
      mockTags.productSuggestion = 'Resistance Band Set';
    }
  }
  
  if (lowercaseCaption.includes('beauty') || lowercaseCaption.includes('skincare') || lowercaseCaption.includes('makeup') || 
      lowercaseCaption.includes('serum') || lowercaseCaption.includes('vitamin') || lowercaseCaption.includes('glow')) {
    mockTags.tags.push('beauty', 'skincare', 'wellness');
    if (lowercaseCaption.includes('serum') || lowercaseCaption.includes('vitamin')) {
      mockTags.productSuggestion = 'Vitamin C Serum';
    }
  }
  
  if (lowercaseCaption.includes('coffee') || lowercaseCaption.includes('espresso') || lowercaseCaption.includes('drink') || 
      lowercaseCaption.includes('café') || lowercaseCaption.includes('caffeine')) {
    mockTags.tags.push('coffee', 'lifestyle', 'productivity');
    if (lowercaseCaption.includes('espresso') || lowercaseCaption.includes('machine')) {
      mockTags.productSuggestion = 'Espresso Machine';
    }
  }
  
  if (lowercaseCaption.includes('food') || lowercaseCaption.includes('recipe') || lowercaseCaption.includes('nutrition') || 
      lowercaseCaption.includes('cooking') || lowercaseCaption.includes('kitchen') || lowercaseCaption.includes('air fryer')) {
    mockTags.tags.push('food', 'cooking', 'kitchen');
    if (lowercaseCaption.includes('air fryer') || lowercaseCaption.includes('fryer')) {
      mockTags.productSuggestion = 'Air Fryer';
    }
  }
  
  if (lowercaseCaption.includes('travel') || lowercaseCaption.includes('portable') || lowercaseCaption.includes('stand') || 
      lowercaseCaption.includes('phone stand') || lowercaseCaption.includes('content')) {
    mockTags.tags.push('travel', 'accessories', 'portable');
    if (lowercaseCaption.includes('stand') || lowercaseCaption.includes('phone')) {
      mockTags.productSuggestion = 'Phone Stand';
    }
  }
  
  if (lowercaseCaption.includes('work') || lowercaseCaption.includes('home') || lowercaseCaption.includes('desk') || 
      lowercaseCaption.includes('productivity') || lowercaseCaption.includes('setup')) {
    mockTags.tags.push('work', 'home', 'productivity');
  }
  
  // Add lifestyle tag for general content
  if (mockTags.tags.length > 0) {
    mockTags.tags.push('lifestyle');
  }
  
  // Remove duplicates
  mockTags.tags = [...new Set(mockTags.tags)];
  
  if (mockTags.tags.length === 0) {
    mockTags.tags = ['lifestyle', 'recommended'];
  }
  
  return mockTags;
};
