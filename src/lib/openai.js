// OpenAI integration for intelligent service matching

/**
 * Uses OpenAI to match user search query with available services
 * @param {string} userQuery - The user's search query
 * @param {Array} availableServices - Array of available services from database
 * @returns {Promise<Array>} Array of matched services with relevance scores
 */
export async function matchServicesWithAI(userQuery, availableServices) {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. Falling back to basic search.');
      return matchServicesBasic(userQuery, availableServices);
    }

    // If OpenAI is not available, fall back to basic matching
    if (typeof window === 'undefined' || !window.fetch) {
      return matchServicesBasic(userQuery, availableServices);
    }

    // Create a prompt for OpenAI
    const serviceList = availableServices.map(s => ({
      id: s.id,
      name: s.service_name || s.title,
      description: s.description || '',
      category: s.category || '',
      type: s.type || ''
    }));

    const prompt = `You are a service matching assistant. Match the user's query with the most relevant services from the list below.

User Query: "${userQuery}"

Available Services:
${serviceList.map((s, i) => `${i + 1}. ${s.name} (${s.category || 'General'}) - ${s.description || 'No description'}`).join('\n')}

Return a JSON array of service IDs ordered by relevance (most relevant first). Only include services that are actually relevant to the user's query. Format: [{"id": "service-id", "relevance": 0.95, "reason": "brief reason"}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that matches user queries with services. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return matchServicesBasic(userQuery, availableServices);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return matchServicesBasic(userQuery, availableServices);
    }

    // Parse the JSON response
    let matchedServices = [];
    try {
      // Extract JSON from response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matchedServices = JSON.parse(jsonMatch[0]);
      } else {
        matchedServices = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return matchServicesBasic(userQuery, availableServices);
    }

    // Map matched services back to full service objects
    const matchedIds = matchedServices.map(m => m.id);
    const matchedFullServices = availableServices
      .filter(s => matchedIds.includes(s.id || s.service_id))
      .sort((a, b) => {
        const aIndex = matchedIds.indexOf(a.id || a.service_id);
        const bIndex = matchedIds.indexOf(b.id || b.service_id);
        return aIndex - bIndex;
      });

    return matchedFullServices.length > 0 ? matchedFullServices : matchServicesBasic(userQuery, availableServices);
  } catch (error) {
    console.error('Error in matchServicesWithAI:', error);
    return matchServicesBasic(userQuery, availableServices);
  }
}

/**
 * Basic service matching fallback (no AI)
 * @param {string} userQuery - The user's search query
 * @param {Array} availableServices - Array of available services
 * @returns {Array} Array of matched services
 */
function matchServicesBasic(userQuery, availableServices) {
  if (!userQuery || !availableServices || availableServices.length === 0) {
    return availableServices || [];
  }

  const query = userQuery.toLowerCase().trim();
  const queryWords = query.split(/\s+/);

  // Score each service
  const scoredServices = availableServices.map(service => {
    const name = (service.service_name || service.title || '').toLowerCase();
    const description = (service.description || '').toLowerCase();
    const category = (service.category || '').toLowerCase();
    const type = (service.type || '').toLowerCase();
    
    let score = 0;

    // Exact match in name
    if (name.includes(query)) {
      score += 10;
    }

    // Word matches in name
    queryWords.forEach(word => {
      if (name.includes(word)) {
        score += 5;
      }
    });

    // Matches in description
    queryWords.forEach(word => {
      if (description.includes(word)) {
        score += 2;
      }
    });

    // Category/type matches
    if (category.includes(query) || type.includes(query)) {
      score += 3;
    }

    return { service, score };
  });

  // Sort by score and filter out zero scores
  const filtered = scoredServices
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service);

  // If we have matches, return them; otherwise return all services
  return filtered.length > 0 ? filtered : availableServices;
}

/**
 * Normalize and extract service keywords from user query
 * @param {string} userQuery - The user's search query
 * @returns {string} Normalized service name/keyword
 */
export function normalizeServiceQuery(userQuery) {
  if (!userQuery) return '';
  
  const normalized = userQuery.toLowerCase().trim();
  
  // Common service mappings
  const serviceMappings = {
    'tv': 'tv mounting',
    'television': 'tv mounting',
    'mount tv': 'tv mounting',
    'hang tv': 'tv mounting',
    'plumber': 'plumbing',
    'plumb': 'plumbing',
    'electrician': 'electrical',
    'electric': 'electrical',
    'clean': 'cleaning',
    'cleaner': 'cleaning',
    'cleaning service': 'cleaning',
    'handyman': 'handyman services',
    'handy man': 'handyman services',
    'flat pack': 'flatpack assembly',
    'ikea': 'flatpack assembly',
    'furniture': 'flatpack assembly',
    'light': 'light fitting',
    'lamp': 'light fitting',
    'carpenter': 'carpentry',
    'carpentry work': 'carpentry'
  };

  // Check for exact mappings
  for (const [key, value] of Object.entries(serviceMappings)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  return normalized;
}
