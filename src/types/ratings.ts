export const PRIME_RATINGS = [
  'Instructor Rating',
  'Instrument Rating',
  'Aerobatics Rating'
] as const

export const TYPE_RATINGS = [
  'C-152',
  'C-172',
  'Pa-28',
  'Pa-38'
] as const

export const ENDORSEMENTS = [
  'Night',
  'Cross Country'
] as const

export type PrimeRatingType = typeof PRIME_RATINGS[number]
export type TypeRatingType = typeof TYPE_RATINGS[number]
export type EndorsementType = typeof ENDORSEMENTS[number] 