import { supabase } from './supabaseClient';

const TABLE = 'tax_calculations';

/**
 * Build a short, human-readable title for a saved calculation from
 * whatever party info is available. Falls back gracefully if fields
 * are missing (forms are all optional/free-text in this app).
 */
function buildTitle({ computationType, partyInfo }) {
  const typeLabel = { sale: 'Sale', donation: 'Donation', estate: 'Estate' }[computationType] || computationType;

  if (computationType === 'estate') {
    const name = partyInfo?.deceasedInfo?.name;
    return name ? `${typeLabel} — ${name}` : `${typeLabel} computation`;
  }

  const from = partyInfo?.sellerInfo?.name;
  const to = partyInfo?.buyerInfo?.name;
  if (from && to) return `${typeLabel} — ${from} to ${to}`;
  if (from) return `${typeLabel} — ${from}`;
  return `${typeLabel} computation`;
}

/**
 * Save a completed tax computation to Supabase.
 *
 * @param {Object} params
 * @param {'sale'|'donation'|'estate'} params.computationType
 * @param {Object} params.partyInfo - e.g. { sellerInfo, buyerInfo } or { deceasedInfo }
 * @param {Object} params.propertyDetails - raw property/estate form data
 * @param {Object} params.results - the computed { breakdown, totalTax, ... } object
 * @param {string} [params.notes]
 */
export async function saveCalculation({ computationType, partyInfo, propertyDetails, results, notes }) {
  if (!results) throw new Error('Cannot save a calculation with no results — compute the tax first.');

  const row = {
    computation_type: computationType,
    title: buildTitle({ computationType, partyInfo }),
    party_info: partyInfo || {},
    property_details: propertyDetails || {},
    computation_result: results,
    total_tax: results.totalTax || 0,
    notes: notes || null,
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) throw error;
  return data;
}

/**
 * List saved calculations, most recent first.
 * @param {Object} [opts]
 * @param {'sale'|'donation'|'estate'} [opts.computationType] - filter by type
 * @param {number} [opts.limit]
 */
export async function listCalculations({ computationType, limit = 50 } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (computationType) {
    query = query.eq('computation_type', computationType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCalculation(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function deleteCalculation(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
