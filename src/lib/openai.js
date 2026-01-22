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
      description: (s.description || '').substring(0, 100), // Limit description length
      ideal_for: s.ideal_for || ''
    }));


    const prompt = `Match the user's service request with relevant services. BE PRECISE - prioritize exact matches.

USER REQUEST: "${userQuery}"

AVAILABLE SERVICES:
${JSON.stringify(serviceList.slice(0, 100), null, 2)}

CRITICAL RULES:
1. PRIORITY ORDER (most important first):
   - Services with EXACT keyword match (if user searches "tv mount", return services with keyword "tv mount")
   - Services with service name containing the exact search terms
   - Services with keywords containing the search terms
   - Only include generic services (like "Carpenter") if NO specific matches exist

2. EXAMPLES:
   - "tv mount" → Return TV mounting/installation services, NOT generic carpentry
   - "tap leak" → Return plumbing services, NOT general handyman
   - "deep clean" → Return deep cleaning services, NOT general cleaning

3. DO NOT return generic services (Carpenter, Handyman, etc.) when specific services match

RETURN FORMAT: JSON array with service IDs and scores.
Example: [{"id": "abc-123-uuid", "score": 0.95}, {"id": "def-456-uuid", "score": 0.85}]

SCORING:
- Exact keyword match: 0.95-1.0
- Service name match: 0.85-0.94
- Keyword contains match: 0.75-0.84
- Generic/category match: 0.5-0.74 (only if no specific matches)

Return up to 15 services, ordered by relevance. Return [] only if absolutely nothing matches.`;

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
            content: 'You are a helpful service matching assistant. Match user queries with relevant services. Return a JSON array with service IDs and relevance scores. Always return valid JSON - use format: [{"id": "uuid", "score": 0.9}]. Be helpful and include services that match the user\'s intent.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
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
      // Clean the content - remove markdown code blocks if present
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks (```json ... ```)
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      }
      
      // Try to find JSON array in the response
      const jsonMatch = cleanedContent.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        matchedServices = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole content
        matchedServices = JSON.parse(cleanedContent);
      }
      
      // Validate that we got an array
      if (!Array.isArray(matchedServices)) {
        return matchServicesBasic(userQuery, availableServices);
      }
    } catch (parseError) {
      return matchServicesBasic(userQuery, availableServices);
    }

    // If AI returned empty array, fall back to basic search
    if (!matchedServices || matchedServices.length === 0) {
      return matchServicesBasic(userQuery, availableServices);
    }

    // Map matched services back to full service objects
    // Handle both formats: [{"id": "...", "score": 0.9}] or just ["id1", "id2"]
    const matchedIds = matchedServices.map(m => {
      if (typeof m === 'string') return m;
      if (typeof m === 'object' && m.id) return m.id;
      return null;
    }).filter(id => id !== null);

    if (matchedIds.length === 0) {
      return matchServicesBasic(userQuery, availableServices);
    }

    const matchedFullServices = availableServices
      .filter(s => matchedIds.includes(s.id))
      .sort((a, b) => {
        const aIndex = matchedIds.indexOf(a.id);
        const bIndex = matchedIds.indexOf(b.id);
        return aIndex - bIndex;
      });

    
    // If we found matches, return them. Otherwise fall back to basic search
    if (matchedFullServices.length > 0) {
      return matchedFullServices;
    } else {
      return matchServicesBasic(userQuery, availableServices);
    }
  } catch (error) {
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
  const queryNoSpaces = query.replace(/\s+/g, '');

    // Score each service
    const scoredServices = availableServices.map(service => {
      // V2 schema uses 'service' field, also check 'service_name' and 'title' for compatibility
      const name = (service.service || service.service_name || service.title || '').toLowerCase();
      const description = (service.description || '').toLowerCase();
      const category = (service.category || '').toLowerCase();
      const idealFor = (service.ideal_for || '').toLowerCase();
      const keywords = service.keywords || [];
      const keywordsLower = keywords.map(k => k.toLowerCase());
      
      let score = 0;

      // EXACT keyword match (HIGHEST PRIORITY - 1000 points)
      if (keywordsLower.some(k => k === query)) {
        score += 1000;
      }

      // Flexible keyword match (e.g., "tv mount" matches "tv mounting")
      const queryNoSpaces = query.replace(/\s+/g, '');
      if (keywordsLower.some(k => {
        const kNoSpaces = k.replace(/\s+/g, '');
        return k.includes(query) || query.includes(k) ||
               kNoSpaces === queryNoSpaces ||
               kNoSpaces === queryNoSpaces + 'ing' ||
               queryNoSpaces === kNoSpaces + 'ing' ||
               kNoSpaces === queryNoSpaces.replace('ing', '') ||
               queryNoSpaces === kNoSpaces.replace('ing', '');
      })) {
        score += 800; // Very high priority for flexible matches
      }

      // Keyword contains search term (high priority)
      if (keywordsLower.some(k => k.includes(query) || query.includes(k))) {
        score += 500;
      }

      // Exact match in service name (high priority)
      if (name === query) {
        score += 200;
      } else if (name.includes(query)) {
        score += 100;
      }

      // Service name contains all words from search
      const allWordsMatch = queryWords.every(word => word.length > 1 && name.includes(word));
      if (allWordsMatch && queryWords.length > 0) {
        score += 150;
      }

      // Word matches in keywords (high priority)
      queryWords.forEach(word => {
        if (word.length > 2 && keywordsLower.some(k => k.includes(word))) {
          score += 40;
        }
      });

      // Word matches in service name
      queryWords.forEach(word => {
        if (word.length > 2 && name.includes(word)) {
          score += 30;
        }
      });

      // Category match (lower priority - penalize generic categories)
      const isGenericCategory = ['carpenter', 'handyman', 'multi trader'].includes(category);
      if (category.includes(query)) {
        score += isGenericCategory ? 5 : 20; // Penalize generic categories
      }

      // Word matches in category
      queryWords.forEach(word => {
        if (word.length > 2 && category.includes(word)) {
          score += isGenericCategory ? 3 : 15;
        }
      });

      // Matches in description (low priority)
      queryWords.forEach(word => {
        if (word.length > 2 && description.includes(word)) {
          score += 5;
        }
      });

      // Matches in ideal_for (lowest priority)
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

    // If we have high-scoring matches (exact or flexible keyword matches), filter out generic services
    const queryNoSpaces = query.replace(/\s+/g, '');
    const hasExactMatches = filtered.some(service => {
      const keywords = (service.keywords || []).map(k => k.toLowerCase());
      const name = (service.service || '').toLowerCase();
      const nameNoSpaces = name.replace(/\s+/g, '');
      
      // Check exact match
      if (keywords.some(k => k === query) || name === query) {
        return true;
      }
      
      // Check flexible match (e.g., "tv mount" vs "tv mounting")
      if (keywords.some(k => {
        const kNoSpaces = k.replace(/\s+/g, '');
        return kNoSpaces === queryNoSpaces ||
               kNoSpaces === queryNoSpaces + 'ing' ||
               queryNoSpaces === kNoSpaces + 'ing';
      })) {
        return true;
      }
      
      if (nameNoSpaces === queryNoSpaces ||
          nameNoSpaces === queryNoSpaces + 'ing' ||
          queryNoSpaces === nameNoSpaces + 'ing') {
        return true;
      }
      
      return false;
    });

    if (hasExactMatches) {
      // Filter out generic services when we have specific matches
      const genericCategories = ['carpenter', 'handyman', 'multi trader'];
      const specificMatches = filtered.filter(service => {
        const category = (service.category || '').toLowerCase();
        const keywords = (service.keywords || []).map(k => k.toLowerCase());
        const name = (service.service || '').toLowerCase();
        
        // Keep if it has exact or flexible keyword/name match
        const nameNoSpaces = name.replace(/\s+/g, '');
        if (keywords.some(k => {
          const kNoSpaces = k.replace(/\s+/g, '');
          return k === query || kNoSpaces === queryNoSpaces ||
                 kNoSpaces === queryNoSpaces + 'ing' ||
                 queryNoSpaces === kNoSpaces + 'ing';
        }) || name === query || nameNoSpaces === queryNoSpaces ||
            nameNoSpaces === queryNoSpaces + 'ing' ||
            queryNoSpaces === nameNoSpaces + 'ing') {
          return true;
        }
        
        // Keep if category is not generic
        if (!genericCategories.includes(category)) {
          return true;
        }
        
        // Filter out generic services
        return false;
      });
      
        return specificMatches.length > 0 ? specificMatches : filtered;
    }

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
