// Service matching via Supabase Edge Function proxy (OpenAI key stays on server)

/**
 * Uses AI to match user search query with available services.
 * Calls Supabase Edge Function match-services-ai (proxy) – no OpenAI call from the client.
 * @param {string} userQuery - The user's search query
 * @param {Array} availableServices - Array of available services from database
 * @returns {Promise<Array>} Array of matched services
 */
export async function matchServicesWithAI(userQuery, availableServices) {
  try {
    if (typeof window === 'undefined' || !availableServices?.length) {
      return matchServicesBasic(userQuery, availableServices);
    }

    const serviceList = availableServices.map(s => ({
      id: s.id,
      name: s.service || s.service_name || s.title || 'Unknown',
      category: s.category || '',
      keywords: s.keywords || [],
      description: (s.description || '').substring(0, 100),
      ideal_for: s.ideal_for || '',
    }));

    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.functions.invoke('match-services-ai', {
      body: { userQuery: userQuery.trim().toLowerCase(), serviceList },
    });

    if (error || !data?.matchedIds?.length) {
      return matchServicesBasic(userQuery, availableServices);
    }

    const matchedIds = data.matchedIds;
    const matchedFullServices = availableServices
      .filter(s => matchedIds.includes(s.id))
      .sort((a, b) => matchedIds.indexOf(a.id) - matchedIds.indexOf(b.id));

    return matchedFullServices.length > 0 ? matchedFullServices : matchServicesBasic(userQuery, availableServices);
  } catch (_) {
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
 * Handles natural language queries like "i need a handyman" or "describe the service"
 * @param {string} userQuery - The user's search query
 * @returns {string} Normalized service name/keyword
 */
export function normalizeServiceQuery(userQuery) {
  if (!userQuery) return '';
  
  let normalized = userQuery.toLowerCase().trim();
  
  // Remove common natural language phrases
  const stopPhrases = [
    'i need', 'i want', 'i\'m looking for', 'i need a', 'i need an',
    'can you', 'can someone', 'please', 'someone to', 'someone who',
    'help me', 'help with', 'looking for', 'need help', 'want help',
    'describe', 'description', 'tell me about', 'what is', 'what are',
    'show me', 'find me', 'get me', 'hire', 'book', 'schedule'
  ];
  
  stopPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    normalized = normalized.replace(regex, '').trim();
  });
  
  // Remove common articles and prepositions
  normalized = normalized.replace(/\b(a|an|the|some|any)\b/gi, '').trim();
  normalized = normalized.replace(/\b(to|for|with|in|on|at|by|from|of)\b/gi, '').trim();
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Common service mappings - ordered by specificity (more specific first)
  const serviceMappings = [
    // Handyman / Multi Trader (check early for natural language queries)
    { patterns: ['handyman', 'handy man', 'handy-person', 'handyperson', 'odd jobs', 'general repairs', 'fix things', 'repair things', 'maintenance', 'handy'], result: 'handyman' },
    { patterns: ['multi trader', 'multi-trade', 'multitrade'], result: 'multi trader' },
    
    // TV & Technology
    { patterns: ['tv mount', 'mount tv', 'hang tv', 'wall mount tv', 'television mount', 'tv wall', 'tv installation'], result: 'tv mounting' },
    { patterns: ['tv', 'television', 'tv install'], result: 'tv' },
    
    // Cleaning
    { patterns: ['end of tenancy', 'move out clean', 'tenant clean', 'landlord clean', 'end tenancy'], result: 'end of tenancy' },
    { patterns: ['deep clean', 'deep cleaning'], result: 'deep clean' },
    { patterns: ['after builder', 'post construction', 'renovation clean', 'after builders'], result: 'after builders' },
    { patterns: ['oven clean', 'oven cleaning'], result: 'oven cleaning' },
    { patterns: ['carpet clean', 'rug clean', 'carpet cleaning'], result: 'carpet cleaning' },
    { patterns: ['sofa clean', 'couch clean', 'upholstery', 'sofa cleaning'], result: 'sofa cleaning' },
    { patterns: ['clean', 'cleaner', 'cleaning service', 'house clean'], result: 'cleaning' },
    
    // Plumbing
    { patterns: ['tap leak', 'leaking tap', 'dripping tap'], result: 'tap leak' },
    { patterns: ['tap', 'faucet', 'leak', 'drip'], result: 'tap' },
    { patterns: ['toilet', 'loo', 'wc', 'toilet repair'], result: 'toilet' },
    { patterns: ['boiler', 'heating', 'boiler repair', 'boiler service'], result: 'boiler' },
    { patterns: ['plumber', 'plumb', 'plumbing'], result: 'plumbing' },
    
    // Electrical
    { patterns: ['electrician', 'electric', 'electrical', 'electrical work'], result: 'electrical' },
    { patterns: ['light fitting', 'light install', 'lamp', 'light fixture'], result: 'light fitting' },
    { patterns: ['socket', 'plug', 'outlet', 'socket repair'], result: 'socket' },
    
    // Certificates
    { patterns: ['eicr', 'electrical certificate', 'electrical safety', 'electrical inspection'], result: 'eicr' },
    { patterns: ['gas safety', 'gas certificate', 'cp12', 'gas safe'], result: 'gas safety' },
    { patterns: ['pat test', 'appliance test', 'pat testing'], result: 'pat testing' },
    { patterns: ['fire alarm', 'smoke alarm', 'fire safety'], result: 'fire alarm' },
    
    // Handyman / Multi Trader services
    { patterns: ['flat pack', 'flatpack', 'ikea', 'furniture assembly', 'assemble furniture'], result: 'flatpack' },
    { patterns: ['shelf', 'shelves', 'shelving', 'install shelf'], result: 'shelf' },
    { patterns: ['blind', 'blinds', 'curtain', 'curtains'], result: 'blind' },
    { patterns: ['picture hang', 'hang picture', 'artwork', 'picture mounting'], result: 'picture hanging' },
    
    // Carpentry
    { patterns: ['door', 'doors', 'door install', 'door repair'], result: 'door' },
    { patterns: ['floor', 'flooring', 'laminate', 'floor install'], result: 'flooring' },
    { patterns: ['carpenter', 'carpentry', 'wood work', 'woodwork'], result: 'carpentry' },
    
    // Painting
    { patterns: ['paint', 'painter', 'painting', 'decorator', 'decorating'], result: 'painting' },
    
    // Appliance
    { patterns: ['appliance repair', 'appliance fix', 'broken appliance'], result: 'appliance repair' },
    { patterns: ['washing machine', 'washer'], result: 'washing machine' },
    { patterns: ['dishwasher'], result: 'dishwasher' },
    { patterns: ['fridge', 'refrigerator', 'freezer'], result: 'fridge' },
    
    // Other common queries
    { patterns: ['fix', 'repair', 'broken'], result: 'repair' },
    { patterns: ['install', 'installation', 'fitting'], result: 'install' }
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
