// @dada78641/ganymede <https://github.com/msikma/ganymede>
// © MIT license

import type {BaseMessageOptions} from 'discord.js'
import {getGenericPayload} from './shows/generic.ts'
import {getOnePiecePayload} from './shows/one-piece.ts'
import type {MangaPlusPostData} from '../types.ts'

/**
 * Returns a MANGA Plus payload by show.
 */
export async function getPayloadByShow(postData: MangaPlusPostData, searchIdentifier?: string): Promise<BaseMessageOptions> {
  switch (searchIdentifier) {
    case 'one_piece':
      return getOnePiecePayload(postData)
    default:
      return getGenericPayload(postData)
  }
}
