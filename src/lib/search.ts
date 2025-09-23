// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import {scrapeMangaPlusData} from './scrape.ts'
import type {MangaPlusSearchData, MangaPlusSearchResult} from '../types.ts'

/**
 * Runs a single search on MANGA Plus.
 */
export async function runMangaPlusSearch(search: MangaPlusSearchData): Promise<MangaPlusSearchResult[]> {
  return scrapeMangaPlusData(search)
}
