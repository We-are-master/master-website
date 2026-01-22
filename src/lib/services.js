// Services API - Functions to fetch services from Supabase
// Updated for V2 schema with keyword search

import { supabase } from './supabase';

// Use v2 table
const SERVICES_TABLE = 'services_v2';

/**
 * Get all active services
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @returns {Promise<Array>} Array of services
 */
export async function getServices(filters = {}) {
  try {
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
      console.error('Error fetching services:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getServices:', error);
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
      console.error('Error fetching service:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getServiceById:', error);
    return null;
  }
}

/**
 * Search services by keyword with relevance scoring
 * Uses the database function for better performance and relevance
 * @param {string} searchTerm - Search term (e.g., "tap leak", "tv mount")
 * @returns {Promise<Array>} Array of matching services sorted by relevance
 */
export async function searchServices(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    // Try using the database function first
    const { data, error } = await supabase
      .rpc('search_services_by_keyword', { search_term: searchTerm.trim().toLowerCase() });

    if (error) {
      console.warn('RPC search failed, falling back to direct query:', error);
      // Fallback to direct query if function doesn't exist
      return searchServicesDirectly(searchTerm);
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchServices:', error);
    return searchServicesDirectly(searchTerm);
  }
}

/**
 * Fallback search function using direct queries
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching services
 */
async function searchServicesDirectly(searchTerm) {
  try {
    const term = searchTerm.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('is_active', true)
      .or(`service.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,ideal_for.ilike.%${term}%,keywords.cs.{${term}}`)
      .order('category', { ascending: true })
      .order('service', { ascending: true });

    if (error) {
      console.error('Error in direct search:', error);
      return [];
    }

    // Sort by relevance client-side
    const sorted = (data || []).sort((a, b) => {
      const aScore = calculateRelevance(a, term);
      const bScore = calculateRelevance(b, term);
      return bScore - aScore;
    });

    return sorted;
  } catch (error) {
    console.error('Error in searchServicesDirectly:', error);
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
  const termLower = term.toLowerCase();
  
  // Exact match in service name (highest priority)
  if (service.service?.toLowerCase().includes(termLower)) score += 10;
  
  // Match in category
  if (service.category?.toLowerCase().includes(termLower)) score += 8;
  
  // Exact keyword match
  if (service.keywords?.some(k => k.toLowerCase() === termLower)) score += 7;
  
  // Partial keyword match
  if (service.keywords?.some(k => k.toLowerCase().includes(termLower))) score += 5;
  
  // Match in description
  if (service.description?.toLowerCase().includes(termLower)) score += 3;
  
  // Match in ideal_for
  if (service.ideal_for?.toLowerCase().includes(termLower)) score += 2;
  
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
    console.error('Error in getServicesGroupedByCategory:', error);
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
      console.error('Error fetching categories:', error);
      throw error;
    }

    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories.sort();
  } catch (error) {
    console.error('Error in getCategories:', error);
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
      console.error('Error fetching popular services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPopularServices:', error);
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
      console.error('Error fetching suggestions:', error);
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
    console.error('Error in getServiceSuggestions:', error);
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
