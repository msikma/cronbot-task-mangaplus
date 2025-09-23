// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import type {BaseMessageOptions} from 'discord.js'
import {FeedTask} from '@dada78641/cronbot'
import {scheduleEvery} from '@dada78641/cronbot/util'
import type {BotTask} from '@dada78641/cronbot'
import {getPayloadByShow} from './lib/shows.ts'
import {runTaskSearches, removeThumbnailHash} from './data.ts'
import type {MangaPlusConfig, MangaPlusFeedItem} from './types.ts'

const iconsMangaPlus = [
  // M+ Circular
  'https://i.imgur.com/r2xgC5N.png',
  // MANGA+ with Luffy
  'https://i.imgur.com/bYWZcEt.png',
  // MANGA Plus banner
  'https://i.imgur.com/QppU3Wt.png',
]

class MangaPlusFeedTask extends FeedTask<MangaPlusConfig> {
  async getFeedItems(): Promise<MangaPlusFeedItem[]> {
    return runTaskSearches(this.taskConfig.searches)
  }
  async getFeedItemPayload(feedItem: MangaPlusFeedItem): Promise<BaseMessageOptions> {
    return await getPayloadByShow(feedItem.data, feedItem.taskConfig.identifier)
  }
  cleanFeedItemCacheData(feedItem: MangaPlusFeedItem): MangaPlusFeedItem {
    return removeThumbnailHash(feedItem)
  }
}

export const taskMangaPlus: BotTask<MangaPlusConfig> = {
  id: 'mangaplus',
  name: 'MANGA Plus',
  design: {
    color: 0xa50d15,
    icon: iconsMangaPlus[1],
  },
  actions: [
    {
      action: MangaPlusFeedTask,
      description: 'searches MANGA Plus for new chapters',
      interval: scheduleEvery(10, 'minutes'),
      deferred: false,
      batchLimit: 1,
    }
  ]
}
