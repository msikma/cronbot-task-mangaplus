// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import type {FeedItem, FeedItemUpdate} from '@dada78641/cronbot'

// The full config for this task.
export interface MangaPlusConfig {
  searches: MangaPlusSearchData[]
}

// A single search request, defined in the config.
export interface MangaPlusSearchData {
  data: {
    mangaId: string
    minChapterNumber: number | null
  }
  identifier: string
  channel: string
}

// Data for a given manga title.
export type MangaPlusPostData = {
  title: string
  number: number
  link: string
  thumbnail: string | null
  date: Date | null
  manga: {
    id: string
    name: string | null
    author: string | null
  }
}

// A full search result object with unique identifier.
export type MangaPlusSearchResult = {
  guid: string
  data: MangaPlusPostData
}

export type MangaPlusFeedItem = FeedItem<MangaPlusPostData, MangaPlusSearchData>
export type MangaPlusFeedItemUpdate = FeedItemUpdate<MangaPlusPostData, MangaPlusSearchData>
