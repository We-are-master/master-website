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

    // Create a compact service list for the prompt (V2 schema: 'service' field, 'keywords' array)
    const serviceList = availableServices.map(s => ({
      id: s.id,
      name: s.service || s.service_name || s.title || 'Unknown',
      category: s.category || '',
      keywords: s.keywords || [],
      description: s.description || '',
      ideal_for: s.ideal_for || ''
    }));

    const prompt = `You are a service matching assistant for a home services platform. Your job is to match the user's search query with the MOST RELEVANT services.

IMPORTANT RULES:
1. Only return services that are DIRECTLY relevant to what the user is searching for
2. If the user searches for "TV mounting" or "mount TV", return TV-related services, NOT carpentry
3. If user searches for "plumber" or "tap leak", return plumbing services
4. If user searches for "cleaning", return cleaning services
5. Pay attention to the service name, category, and keywords
6. Be strict - don't include services that are only vaguely related
7. Return MAXIMUM 15 most relevant services

User Search Query: "${userQuery}"

Available Services (JSON format):
${JSON.stringify(serviceList.slice(0, 100), null, 0)}

Return a JSON array with the IDs of ONLY the relevant services, ordered by relevance (most relevant first).
Format: [{"id": "uuid-here", "score": 0.95}]

If NO services match the query, return an empty array: []`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise service matching assistant. You MUST only return services that directly match what the user is looking for. Be strict and accurate. Always return valid JSON arrays. Never include unrelated services.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return matchServicesBasic(userQuery, availableServices);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('OpenAI response:', content);
    
    if (!content) {
      return matchServicesBasic(userQuery, availableServices);
    }

    // Parse the JSON response
    let matchedServices = [];
    try {
      // Extract JSON from response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        matchedServices = JSON.parse(jsonMatch[0]);
      } else {
        matchedServices = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError, content);
      return matchServicesBasic(userQuery, availableServices);
    }

    // If AI returned empty array, fall back to basic search
    if (!matchedServices || matchedServices.length === 0) {
      console.log('AI returned no matches, falling back to basic search');
      return matchServicesBasic(userQuery, availableServices);
    }

    // Map matched services back to full service objects
    const matchedIds = matchedServices.map(m => m.id);
    const matchedFullServices = availableServices
      .filter(s => matchedIds.includes(s.id))
      .sort((a, b) => {
        const aIndex = matchedIds.indexOf(a.id);
        const bIndex = matchedIds.indexOf(b.id);
        return aIndex - bIndex;
      });

    console.log('AI matched services:', matchedFullServices.length);
    
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
  const queryWords = query.split(/\s+/).filter(w => w.length > 1);

  // Score each service
  const scoredServices = availableServices.map(service => {
    // V2 schema uses 'service' field, also check 'service_name' and 'title' for compatibility
    const name = (service.service || service.service_name || service.title || '').toLowerCase();
    const description = (service.description || '').toLowerCase();
    const category = (service.category || '').toLowerCase();
    const idealFor = (service.ideal_for || '').toLowerCase();
    const keywords = service.keywords || [];
    
    let score = 0;

    // Exact match in service name (highest priority)
    if (name.includes(query)) {
      score += 100;
    }

    // Exact keyword match (very high priority)
    const keywordsLower = keywords.map(k => k.toLowerCase());
    if (keywordsLower.some(k => k === query)) {
      score += 80;
    }

    // Partial keyword match
    if (keywordsLower.some(k => k.includes(query) || query.includes(k))) {
      score += 50;
    }

    // Word matches in service name
    queryWords.forEach(word => {
      if (word.length > 2 && name.includes(word)) {
        score += 30;
      }
    });

    // Word matches in keywords
    queryWords.forEach(word => {
      if (word.length > 2 && keywordsLower.some(k => k.includes(word))) {
        score += 25;
      }
    });

    // Category match
    if (category.includes(query)) {
      score += 20;
    }

    // Word matches in category
    queryWords.forEach(word => {
      if (word.length > 2 && category.includes(word)) {
        score += 15;
      }
    });

    // Matches in description
    queryWords.forEach(word => {
      if (word.length > 2 && description.includes(word)) {
        score += 5;
      }
    });

    // Matches in ideal_for
    queryWords.forEach(word => {
      if (word.length > 2 && idealFor.includes(word)) {
        score += 3;
      }
    });

    return { service, score };
  });

  // Sort by score and filter out zero scores
  const filtered = scoredServices
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service);

  console.log('Basic search results:', filtered.length, 'services found for query:', query);

  // Only return matched services, don't return all if no match
  return filtered;
}

/**
 * Normalize and extract service keywords from user query
 * @param {string} userQuery - The user's search query
 * @returns {string} Normalized service name/keyword
 */
export function normalizeServiceQuery(userQuery) {
  if (!userQuery) return '';
  
  const normalized = userQuery.toLowerCase().trim();
  
  // Common service mappings - ordered by specificity (more specific first)
  const serviceMappings = [
    // TV & Technology
    { patterns: ['tv mount', 'mount tv', 'hang tv', 'wall mount tv', 'television mount', 'tv wall'], result: 'tv mounting' },
    { patterns: ['tv', 'television'], result: 'tv' },
    
    // Cleaning
    { patterns: ['end of tenancy', 'move out clean', 'tenant clean', 'landlord clean'], result: 'end of tenancy' },
    { patterns: ['deep clean'], result: 'deep clean' },
    { patterns: ['after builder', 'post construction', 'renovation clean'], result: 'after builders' },
    { patterns: ['oven clean'], result: 'oven cleaning' },
    { patterns: ['carpet clean', 'rug clean'], result: 'carpet cleaning' },
    { patterns: ['sofa clean', 'couch clean', 'upholstery'], result: 'sofa cleaning' },
    { patterns: ['clean', 'cleaner', 'cleaning service'], result: 'cleaning' },
    
    // Plumbing
    { patterns: ['tap', 'faucet', 'leak', 'drip'], result: 'tap' },
    { patterns: ['toilet', 'loo', 'wc'], result: 'toilet' },
    { patterns: ['boiler', 'heating'], result: 'boiler' },
    { patterns: ['plumber', 'plumb', 'plumbing'], result: 'plumbing' },
    
    // Electrical
    { patterns: ['electrician', 'electric', 'electrical'], result: 'electrical' },
    { patterns: ['light fitting', 'light install', 'lamp'], result: 'light fitting' },
    { patterns: ['socket', 'plug', 'outlet'], result: 'socket' },
    
    // Certificates
    { patterns: ['eicr', 'electrical certificate', 'electrical safety'], result: 'eicr' },
    { patterns: ['gas safety', 'gas certificate', 'cp12'], result: 'gas safety' },
    { patterns: ['pat test', 'appliance test'], result: 'pat testing' },
    { patterns: ['fire alarm', 'smoke alarm'], result: 'fire alarm' },
    
    // Handyman / Multi Trader
    { patterns: ['flat pack', 'flatpack', 'ikea', 'furniture assembly'], result: 'flatpack' },
    { patterns: ['shelf', 'shelves', 'shelving'], result: 'shelf' },
    { patterns: ['blind', 'curtain'], result: 'blind' },
    { patterns: ['picture hang', 'hang picture', 'artwork'], result: 'picture hanging' },
    { patterns: ['handyman', 'handy man', 'odd jobs'], result: 'handyman' },
    
    // Carpentry
    { patterns: ['door', 'doors'], result: 'door' },
    { patterns: ['floor', 'flooring', 'laminate'], result: 'flooring' },
    { patterns: ['carpenter', 'carpentry', 'wood work'], result: 'carpentry' },
    
    // Painting
    { patterns: ['paint', 'painter', 'painting', 'decorator'], result: 'painting' }
  ];

  // Check for pattern matches (more specific patterns first)
  for (const mapping of serviceMappings) {
    for (const pattern of mapping.patterns) {
      if (normalized.includes(pattern)) {
        return mapping.result;
      }
    }
  }

  return normalized;
}
