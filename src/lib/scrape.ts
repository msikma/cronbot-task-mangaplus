// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import * as fs from 'fs/promises'
import * as cheerio from 'cheerio'
import {orderBy} from 'lodash-es'
import {fetchPuppeteer} from '@dada78641/cronbot/util'
import type {MangaPlusSearchData, MangaPlusSearchResult, MangaPlusPostData} from '../types.ts'

type MangaInfo = {
  name: string
  author: string
}

/*

Example HTML for extractMangaChapters():

  <div class="ChapterListItem-module_chapterWrapper_3CxyE">
    <img
      alt="thumbnail"
      class="ChapterListItem-module_thumbnail_1w6kS"
      data-src="https://jumpg-assets.tokyo-cdn.com/secure/title/100020/chapter/1022646/chapter_thumbnail/387338.jpg?hash=DcFmeU7xF_JWeTMH03d8hg&amp;expires=1736085600"
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      lazy="loading"
    />
    <div class="ChapterListItem-module_chapterNameContainer_3MJKj">
      <p class="ChapterListItem-module_name_3h9dj">#1132</p>
      <p class="ChapterListItem-module_commentCount_4FxT-">
        <img src="/img/icon_comment.c437702e.svg" class="ChapterListItem-module_commentIconMini_1hQ5R" />306
      </p>
    </div>
    <p class="ChapterListItem-module_title_3Id89">Chapter 1132: Adventure in Elbaph</p>
    <p class="ChapterListItem-module_date_xe1XF">1 Dec 2024</p>
  </div>

*/


/**
 * Returns a Date object from a date-only string.
 * 
 * This expects a string such as "1 Dec 2024". Returns null if we couldn't parse the date.
 */
function getDateFromString(dateString: string): Date | null {
  const date = new Date(`${dateString} 16:00:00 UTC`)
  if (date instanceof Date && !isNaN(Number(date))) {
    return date
  }
  return null
}

/**
 * Returns the URL for a MANGA Plus title.
 */
function getMangaPlusUrl(title: string): string {
  return `https://mangaplus.shueisha.co.jp/titles/${title}`
}

/**
 * Returns the URL for a manga chapter.
 */
function getMangaPlusChapterUrl(chapter: string): string {
  return `https://mangaplus.shueisha.co.jp/viewer/${chapter}`
}

/**
 * Fetches HTML for a MANGA Plus title.
 */
async function fetchMangaPlusHtml(title: string): Promise<string | null> {
  const url = getMangaPlusUrl(title)
  const text = await fetchPuppeteer(url, 'main[class^="TitleDetail-"]')
  // const text = await fs.readFile('./_test/mangaplus/mangaplustest.html', 'utf8')
  return text
}

/**
 * Extracts data from the full title string.
 * 
 * This expects a format like: "Chapter 1132: Adventure in Elbaph".
 */
function getTitleData(titleString: string) {
  const matches = titleString.match(/Chapter\s+([0-9]+):\s+(.+?)$/i)
  if (matches === null) {
    return null
  }
  return {
    number: matches[1].trim(),
    name: matches[2].trim(),
  }
}

/**
 * Extracts chapter data from the image data-src string.
 */
function getChapterData(imageDataSrc?: string) {
  if (imageDataSrc == null) {
    return null
  }
  const matches = imageDataSrc.match(/title\/.+?\/chapter\/(.+?)\//)
  if (matches === null) {
    return null
  }
  return {
    chapter: matches[1].trim()
  }
}

/**
 * Extracts manga chapters from the html.
 */
async function extractMangaChapters($: cheerio.CheerioAPI, mangaId: string, mangaInfo: MangaInfo): Promise<MangaPlusPostData[]> {
  const main = $('main[class^="TitleDetail-"]')
  const items = $('> div > div[class^="ChapterListItem-"] > div:first-child', main).get()
  const chapters = []
  for (const item of items) {
    const title = $('p[class*="ChapterListItem"][class*="title"]', item)
    const date = $('p[class*="ChapterListItem"][class*="date"]', item)
    const image = $('> img[alt="thumbnail"]', item)
    const chapter = getChapterData(image.attr('data-src'))
    if (chapter === null) {
      continue
    }
    const titleData = getTitleData(title.text())
    if (titleData === null) {
      continue
    }
    chapters.push({
      title: titleData.name,
      number: Number(titleData.number),
      link: getMangaPlusChapterUrl(chapter.chapter),
      thumbnail: image.attr('data-src') || null,
      date: getDateFromString(date.text()),
      manga: {
        id: mangaId,
        name: mangaInfo.name,
        author: mangaInfo.author,
      },
    })
  }
  return orderBy(chapters, 'date', 'asc')
}

/**
 * Extracts the manga's base info from the html.
 */
function extractMangaInfo($: cheerio.CheerioAPI): MangaInfo {
  const info = $('div[class^="TitleDetailHeader-"][class*="_info_"]')
  const title = $('*[class*="_title_"]', info)
  const author = $('*[class*="_author_"]', info)
  return {
    name: title.text().trim(),
    author: author.text().trim(),
  }
}

/**
 * Filters chapters we've extracted from the page.
 */
function filterMinChapter(chapters: MangaPlusPostData[], search: MangaPlusSearchData): MangaPlusPostData[] {
  return chapters.filter(chapter => {
    if (search.data.minChapterNumber) {
      return chapter.number >= search.data.minChapterNumber
    }
    return true
  })
}

/**
 * Runs a single search on MANGA Plus.
 */
export async function scrapeMangaPlusData(search: MangaPlusSearchData): Promise<MangaPlusSearchResult[]> {
  const html = await fetchMangaPlusHtml(search.data.mangaId)
  if (!html) {
    throw new Error('Could not obtain MANGA Plus html')
  }
  const $ = cheerio.load(html)
  const manga = extractMangaInfo($)
  const chapters = await extractMangaChapters($, search.data.mangaId, manga)
  // Note: only the last three chapters are readable. The others are locked.
  const filteredChapters = filterMinChapter(chapters, search).slice(-3)
  return filteredChapters.map(chapter => ({
    guid: chapter.link,
    data: chapter,
  }))
}
