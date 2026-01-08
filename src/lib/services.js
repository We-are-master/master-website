// Services API - Functions to fetch services from Supabase

import { supabase } from './supabase';

/**
 * Get all active services
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.type - Filter by type
 * @returns {Promise<Array>} Array of services
 */
export async function getServices(filters = {}) {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('type', { ascending: true })
      .order('service_name', { ascending: true });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
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
      .from('services')
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
 * Search services by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching services
 */
export async function searchServices(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .or(`service_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('category', { ascending: true })
      .order('service_name', { ascending: true });

    if (error) {
      console.error('Error searching services:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchServices:', error);
    return [];
  }
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
      .from('services')
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
 * Get unique types
 * @returns {Promise<Array>} Array of unique type names
 */
export async function getTypes() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('type')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching types:', error);
      throw error;
    }

    const uniqueTypes = [...new Set(data.map(item => item.type))];
    return uniqueTypes.sort();
  } catch (error) {
    console.error('Error in getTypes:', error);
    return [];
  }
}
