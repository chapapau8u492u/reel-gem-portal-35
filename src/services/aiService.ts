
interface AITaggingResponse {
  tags: string[];
  productSuggestion?: string;
}

export const suggestTags = async (caption: string): Promise<AITaggingResponse> => {
  // Mock AI service - in production, this would call OpenAI API
  console.log('Analyzing caption for tags:', caption);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock tag suggestions based on keywords
  const mockTags: AITaggingResponse = {
    tags: [],
    productSuggestion: undefined
  };
  
  const lowercaseCaption = caption.toLowerCase();
  
  if (lowercaseCaption.includes('tech') || lowercaseCaption.includes('gadget') || lowercaseCaption.includes('device')) {
    mockTags.tags.push('tech', 'gadgets');
  }
  
  if (lowercaseCaption.includes('fitness') || lowercaseCaption.includes('workout') || lowercaseCaption.includes('exercise')) {
    mockTags.tags.push('fitness', 'health');
  }
  
  if (lowercaseCaption.includes('beauty') || lowercaseCaption.includes('skincare') || lowercaseCaption.includes('makeup')) {
    mockTags.tags.push('beauty', 'skincare');
  }
  
  if (lowercaseCaption.includes('coffee') || lowercaseCaption.includes('drink')) {
    mockTags.tags.push('coffee', 'lifestyle');
  }
  
  if (lowercaseCaption.includes('food') || lowercaseCaption.includes('recipe') || lowercaseCaption.includes('nutrition')) {
    mockTags.tags.push('food', 'nutrition');
  }
  
  if (mockTags.tags.length === 0) {
    mockTags.tags = ['lifestyle', 'recommended'];
  }
  
  return mockTags;
};
