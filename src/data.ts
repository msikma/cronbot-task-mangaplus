// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import {orderBy} from 'lodash-es'
import {promiseSequential} from '@dada78641/cronbot/util'
import {runMangaPlusSearch} from './lib/search.ts'
import type {MangaPlusConfig, MangaPlusFeedItem} from './types.ts'

/**
 * Runs the MANGA Plus searches configured in the config.
 */
export async function runTaskSearches(taskSearches: MangaPlusConfig['searches']): Promise<MangaPlusFeedItem[]> {
  const results = await promiseSequential(taskSearches.map(taskSearch => async () => {
    const results = orderBy(await runMangaPlusSearch(taskSearch), 'data.date', 'asc')
    return results.flatMap(result => ({
      ...result,
      taskChannel: taskSearch.channel,
      taskConfig: taskSearch,
    }))
  }))
  return results.flat()
}

/**
 * MANGA Plus items have a thumbnail with a hash value.
 * 
 * This hash value will periodically change, so if we don't filter it out before caching,
 * it will cause the cash to be constantly updated for nothing.
 * 
 * Here we'll filter it out so the clean url can be stored in cache.
 */
export function removeThumbnailHash(feedItem: MangaPlusFeedItem): MangaPlusFeedItem {
  if (feedItem.data.thumbnail == null) {
    return feedItem
  }
  const thumbnail = new URL(feedItem.data.thumbnail)
  thumbnail.search = ''
  thumbnail.hash = ''
  return {
    ...feedItem,
    data: {
      ...feedItem.data,
      thumbnail: thumbnail.toString(),
    }
  }
}
