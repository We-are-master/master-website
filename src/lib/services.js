// Services API - Functions to fetch services from Supabase
// Updated for V2 schema with keyword search

import { supabase } from './supabase';

// Use v2 table
const SERVICES_TABLE = 'services_v2';

// In-memory cache for getServices (avoids refetch when AI fallback runs)
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let cache = { data: null, ts: 0 };

/**
 * Get all active services (cached for 2 min to speed up repeated searches)
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @returns {Promise<Array>} Array of services
 */
export async function getServices(filters = {}) {
  try {
    const now = Date.now();
    const useCache = !filters.category && cache.data !== null && (now - cache.ts) < CACHE_TTL_MS;
    if (useCache) {
      return cache.data;
    }

    let query = supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })
      .order('service', { ascending: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const result = data || [];
    if (!filters.category) {
      cache = { data: result, ts: Date.now() };
    }
    return result;
  } catch (error) {
    return [];
  }
}

/**
 * Get services by category
 * @param {string} category - Service category
 * @returns {Promise<Array>} Array of services
 */
export async function getServicesByCategory(category) {
  return getServices({ category });
}

/**
 * Get a single service by ID
 * @param {string} serviceId - Service UUID
 * @returns {Promise<Object|null>} Service object or null
 */
export async function getServiceById(serviceId) {
  try {
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Search services by keyword with relevance scoring
 * Uses the database function for better performance and relevance
 * Handles natural language queries like "i need a handyman"
 * @param {string} searchTerm - Search term (e.g., "tap leak", "tv mount", "i need a handyman")
 * @returns {Promise<Array>} Array of matching services sorted by relevance
 */
export async function searchServices(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    // Normalize the search term to extract core service intent
    const normalized = normalizeSearchTerm(searchTerm);
    
    // Try using the database function first (it handles natural language internally)
    const { data, error } = await supabase
      .rpc('search_services_by_keyword', { search_term: normalized });

    if (error) {
      console.warn('Database search function error, falling back to direct search:', error);
      return searchServicesDirectly(searchTerm);
    }

    return data || [];
  } catch (error) {
    console.warn('Search error, falling back to direct search:', error);
    return searchServicesDirectly(searchTerm);
  }
}

/**
 * Normalize search term to extract core service intent
 * Removes natural language phrases and extracts the actual service being requested
 * @param {string} searchTerm - Raw search term
 * @returns {string} Normalized search term
 */
function normalizeSearchTerm(searchTerm) {
  if (!searchTerm) return '';
  
  let normalized = searchTerm.toLowerCase().trim();
  
  // Remove common natural language phrases
  const stopPhrases = [
    'i need', 'i want', 'i\'m looking for', 'i need a', 'i need an',
    'can you', 'can someone', 'please', 'someone to', 'someone who',
    'help me', 'help with', 'looking for', 'need help', 'want help',
    'describe', 'description', 'tell me about', 'what is', 'what are',
    'show me', 'find me', 'get me', 'hire', 'book', 'schedule',
    'i would like', 'i\'d like', 'i am looking', 'i\'m looking'
  ];
  
  stopPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    normalized = normalized.replace(regex, '').trim();
  });
  
  // Remove common articles and prepositions
  normalized = normalized.replace(/\b(a|an|the|some|any)\b/gi, '').trim();
  normalized = normalized.replace(/\b(to|for|with|in|on|at|by|from|of|my|your|his|her|its|our|their)\b/gi, '').trim();
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized || searchTerm.toLowerCase().trim();
}

/**
 * Fallback search function using direct queries
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching services
 */
async function searchServicesDirectly(searchTerm) {
  try {
    const term = searchTerm.trim().toLowerCase();
    
    // Get all active services and filter client-side for better keyword matching
    // This ensures we can properly search in the keywords array
    const { data: allServices, error } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('is_active', true);

    if (error) {
      return [];
    }

    if (!allServices || allServices.length === 0) {
      return [];
    }


    // Filter services that match the search term (be more flexible)
    const termWords = term.split(/\s+/).filter(w => w.length > 1);
    const matchingServices = allServices.filter(service => {
      const name = (service.service || '').toLowerCase();
      const description = (service.description || '').toLowerCase();
      const category = (service.category || '').toLowerCase();
      const idealFor = (service.ideal_for || '').toLowerCase();
      const keywords = (service.keywords || []).map(k => k.toLowerCase());
      
      // Check exact keyword match (highest priority)
      if (keywords.some(k => k === term)) {
        return true;
      }
      
      // Check if keyword contains the term or vice versa (flexible matching)
      if (keywords.some(k => {
        return k.includes(term) || term.includes(k) || 
               k.replace(/\s+/g, '') === term.replace(/\s+/g, '') ||
               k.replace(/\s+/g, '') === term.replace(/\s+/g, '') + 'ing' ||
               term.replace(/\s+/g, '') === k.replace(/\s+/g, '') + 'ing';
      })) {
        return true;
      }
      
      // Check if all words from search are in keywords
      if (termWords.length > 0 && termWords.every(word => 
        keywords.some(k => k.includes(word) || word.includes(k))
      )) {
        return true;
      }
      
      // Check service name (exact or contains)
      if (name === term || name.includes(term)) {
        return true;
      }
      
      // Check if all words from search are in service name
      if (termWords.length > 0 && termWords.every(word => name.includes(word))) {
        return true;
      }
      
      // Check category
      if (category.includes(term)) {
        return true;
      }
      
      // Check description
      if (description.includes(term)) {
        return true;
      }
      
      // Check ideal_for
      if (idealFor.includes(term)) {
        return true;
      }
      
      return false;
    });

    // Sort by relevance client-side
    const sorted = matchingServices.sort((a, b) => {
      const aScore = calculateRelevance(a, term);
      const bScore = calculateRelevance(b, term);
      return bScore - aScore;
    });

    // Filter out generic services if we have specific matches
    const hasExactKeywordMatches = sorted.some(service => {
      const keywords = (service.keywords || []).map(k => k.toLowerCase());
      return keywords.some(k => k === term);
    });

    if (hasExactKeywordMatches) {
      const genericCategories = ['carpenter', 'handyman', 'multi trader'];
      const filtered = sorted.filter(service => {
        const category = (service.category || '').toLowerCase();
        const keywords = (service.keywords || []).map(k => k.toLowerCase());
        const name = (service.service || '').toLowerCase();
        
        // Keep exact matches
        if (keywords.some(k => k === term) || name === term) {
          return true;
        }
        
        // Keep non-generic categories
        if (!genericCategories.includes(category)) {
          return true;
        }
        
        // Filter out generic services
        return false;
      });
      
      return filtered.length > 0 ? filtered : sorted;
    }
    return sorted;
  } catch (error) {
    return [];
  }
}

/**
 * Calculate relevance score for a service
 * @param {Object} service - Service object
 * @param {string} term - Search term
 * @returns {number} Relevance score
 */
function calculateRelevance(service, term) {
  let score = 0;
  const termLower = term.toLowerCase().trim();
  const termNoSpaces = termLower.replace(/\s+/g, '');
  const keywords = service.keywords || [];
  const keywordsLower = keywords.map(k => k.toLowerCase());
  const termWords = termLower.split(/\s+/).filter(w => w.length > 1);
  
  // EXACT keyword match (HIGHEST PRIORITY - 1000 points)
  if (keywordsLower.some(k => k === termLower)) {
    score += 1000;
  }
  
  // Flexible keyword match (e.g., "tv mount" matches "tv mounting")
  if (keywordsLower.some(k => {
    const kNoSpaces = k.replace(/\s+/g, '');
    return k.includes(termLower) || termLower.includes(k) ||
           kNoSpaces === termNoSpaces ||
           kNoSpaces === termNoSpaces + 'ing' ||
           termNoSpaces === kNoSpaces + 'ing' ||
           kNoSpaces === termNoSpaces.replace('ing', '') ||
           termNoSpaces === kNoSpaces.replace('ing', '');
  })) {
    score += 800; // Very high priority for flexible matches
  }
  
  // All search words match in keywords
  if (termWords.length > 0 && termWords.every(word => 
    keywordsLower.some(k => k.includes(word) || word.includes(k))
  )) {
    score += 600;
  }
  
  // Exact match in service name (high priority)
  const serviceName = service.service?.toLowerCase() || '';
  const serviceNameNoSpaces = serviceName.replace(/\s+/g, '');
  if (serviceName === termLower) {
    score += 200;
  } else if (serviceNameNoSpaces === termNoSpaces || 
             serviceNameNoSpaces === termNoSpaces + 'ing' ||
             termNoSpaces === serviceNameNoSpaces + 'ing') {
    score += 180; // Flexible name match
  } else if (serviceName.includes(termLower)) {
    score += 100;
  }
  
  // Service name contains all words from search
  if (termWords.length > 0 && termWords.every(word => serviceName.includes(word))) {
    score += 150;
  }
  
  // Match in category (lower priority)
  if (service.category?.toLowerCase().includes(termLower)) score += 20;
  
  // Match in description (low priority)
  if (service.description?.toLowerCase().includes(termLower)) score += 10;
  
  // Match in ideal_for (lowest priority)
  if (service.ideal_for?.toLowerCase().includes(termLower)) score += 5;
  
  return score;
}

/**
 * Get services grouped by category
 * @returns {Promise<Object>} Object with categories as keys and arrays of services as values
 */
export async function getServicesGroupedByCategory() {
  try {
    const services = await getServices();
    
    return services.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
    return acc;
  }, {});
  } catch (error) {
    return {};
  }
}

/**
 * Get unique categories
 * @returns {Promise<Array>} Array of unique category names
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('category')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories.sort();
  } catch (error) {
    return [];
  }
}

/**
 * Get popular/featured services
 * @param {number} limit - Number of services to return
 * @returns {Promise<Array>} Array of popular services
 */
export async function getPopularServices(limit = 8) {
  try {
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get service suggestions based on partial input (for autocomplete)
 * @param {string} input - Partial search input
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array>} Array of service suggestions
 */
export async function getServiceSuggestions(input, limit = 5) {
  if (!input || input.trim().length < 2) {
    return [];
  }

  try {
    const term = input.trim().toLowerCase();
    
    // Get services that match the input
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('id, category, service, price, price_type, price_unit, keywords')
      .eq('is_active', true)
      .or(`service.ilike.%${term}%,category.ilike.%${term}%,keywords.cs.{${term}}`)
      .limit(limit * 2); // Get more and filter client-side for better relevance

    if (error) {
      return [];
    }

    // Sort by relevance and limit
    const sorted = (data || [])
      .sort((a, b) => {
        const aScore = calculateRelevance(a, term);
        const bScore = calculateRelevance(b, term);
        return bScore - aScore;
      })
      .slice(0, limit);

    return sorted;
  } catch (error) {
    return [];
  }
}

/**
 * Format price for display
 * @param {Object} service - Service object
 * @returns {string} Formatted price string
 */
export function formatServicePrice(service) {
  if (!service) return '';
  
  const price = parseFloat(service.price).toFixed(2);
  const prefix = service.price_type === 'from' ? 'From ' : '';
  const unit = service.price_unit ? ` ${service.price_unit}` : '';
  
  return `${prefix}£${price}${unit}`;
}

/**
 * Get category icon name
 * @param {string} category - Category name
 * @returns {string} Icon name for the category
 */
export function getCategoryIcon(category) {
  const icons = {
    'Plumbing': 'Droplets',
    'Electrical': 'Zap',
    'TV & Technology': 'Tv',
    'Handyman': 'Wrench',
    'Carpentry': 'Hammer',
    'Painting': 'Paintbrush',
    'Cleaning': 'Sparkles'
  };
  
  return icons[category] || 'Tool';
}
