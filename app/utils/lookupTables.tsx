
type LookupTable = {
  [key: string]: string
}

export const variablesLookupTable: LookupTable = {
  'pr': 'Precipitation',
  'rsds': 'Surface downward solar shortwave radiation',
  'tasmax': 'Air temperature maximum',
  'tasmin': 'Air temperature minimum',
  'uas': '10 m U component of wind speed',
  'vas': '10 m V component of wind speed',
  'wspeed': '10 m wind speed',
  'hursmin': 'Relative humidity minimum',
  'hursmax': 'Relative humidity maximum',
  'huss': 'Specific humidity',
}

export const scenariosLookupTable: LookupTable = {
  'ssp585': 'SSP5-8.5', 
  'ssp370': 'SSP3-7.0', 
  'ssp245': 'SSP2-4.5',
  'historical': 'Historical'
}

// Create a lookup function
export function lookupValue(key: string, table: LookupTable): string | undefined {
  return table[key]
}