// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import {EmbedBuilder, AttachmentBuilder, type BaseMessageOptions} from 'discord.js'
import {applyCurrentTime, fetchBrowser} from '@dada78641/cronbot/util'
import {getGenericPayload} from './generic.ts'
import type {MangaPlusPostData} from '../../types.ts'

const iconsOnePiece = [
  // Chopper
  'https://i.imgur.com/ryrb0Jb.png',
  // Shanks
  'https://i.imgur.com/qRR3pxs.jpeg',
  // Coby
  'https://i.imgur.com/hn7CTYO.png',
]

const showOnePiece = {
  color: 0xda2a33,
  icon: iconsOnePiece[0],
  // MANGA Plus banner with Luffy
  thumbnail: 'https://i.imgur.com/QppU3Wt.png',
}

/**
 * Returns the URL to the wiki page for a given episode or chapter.
 */
export function getWikiUrl(number: number, type: 'episode' | 'chapter', editLink: boolean = false): string {
  return `https://onepiece.fandom.com/wiki/${type === 'episode' ? 'Episode' : 'Chapter'}_${number}${editLink ? '?action=edit' : ''}`
}

/**
 * Fetches the thumbnail buffer.
 */
async function fetchThumbnailBuffer(imageDataSrc?: string): Promise<Buffer | null> {
  if (imageDataSrc == null) {
    return null
  }
  const res = await fetchBrowser(imageDataSrc)
  if (!res.ok) {
    return null
  }
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Returns a payload for a One Piece episode.
 */
export async function getOnePiecePayload(postData: MangaPlusPostData): Promise<BaseMessageOptions> {
  try {
    let attachment
    const embed = new EmbedBuilder()
    embed.setAuthor({name: `New ${postData.manga.name} chapter on MANGA Plus`, iconURL: showOnePiece.icon})
    embed.setTitle(`Chapter ${postData.number} - ${postData.title}`)
    embed.setURL(postData.link)
    embed.setColor(showOnePiece.color)
    if (postData.thumbnail) {
      const buffer = await fetchThumbnailBuffer(postData.thumbnail)
      if (buffer) {
        const filename = `${postData.manga.id}_${postData.number}.jpg`
        attachment = new AttachmentBuilder(buffer, {name: filename})
        embed.setImage(`attachment://${filename}`)
      }
    }
    embed.setThumbnail(showOnePiece.thumbnail)
    if (postData.date) {
      embed.setTimestamp(applyCurrentTime(postData.date))
    }
    const links = []
    if (postData.number != null) {
      links.push(['Fandom wiki article', getWikiUrl(postData.number, 'chapter', false)])
    }
    if (links.length) {
      embed.addFields({name: 'Links', value: links.map(([name, url]) => `* [${name}](${url})`).join('\n'), inline: false})
    }

    return {
      content: undefined,
      embeds: [embed],
      files: attachment ? [attachment] : undefined
    }
  }
  catch {
    return getGenericPayload(postData)
  }
}
