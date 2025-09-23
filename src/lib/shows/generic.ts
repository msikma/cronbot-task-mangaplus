// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import {EmbedBuilder, type BaseMessageOptions} from 'discord.js'
import {taskMangaPlus} from '../../index.ts'
import type {MangaPlusPostData} from '../../types.ts'

export async function getGenericPayload(postData: MangaPlusPostData): Promise<BaseMessageOptions> {
  const embed = new EmbedBuilder()
  embed.setTitle(`Chapter ${postData.number} - ${postData.title}`)
  embed.setURL(postData.link)
  embed.setColor(taskMangaPlus.design.color)
  if (postData.manga.name) {
    embed.setAuthor({name: `New ${postData.manga.name} chapter on MANGA Plus`, iconURL: taskMangaPlus.design.icon})
  }
  else {
    embed.setAuthor({name: 'New manga chapter on MANGA Plus', iconURL: taskMangaPlus.design.icon})
  }
  if (postData.date) {
    embed.setTimestamp(postData.date)
  }

  return {content: undefined, embeds: [embed]}
}
