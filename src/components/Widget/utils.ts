import type { Badges, ChatUserstate } from 'tmi.js';

import type { Message, MessageChunk } from '../../types';
import { globalBadges } from './global-badges';

/**
 * Map, where key is emote id and value is an array of values in format "\d+-\d+".
 */
interface Emotes {
  [emoteId: string]: string[];
}

/**
 * Emote meta data.
 */
interface Emote {
  from: number;
  to: number;
  emoteId: string;
}

/**
 * Converts emotes map to an array of objects, containing information where emote starts and ends.
 * Also, returned array is sorted in ascending order of emote beginning.
 * @param emotes - emotes map.
 */
function prepareEmotes(emotes: Emotes): Emote[] {
  return Object.entries(emotes).reduce<Emote[]>((acc, [emoteId, ranges]) => {
    ranges.forEach(rangeStr => {
      const match = rangeStr.match(/^(\d)+-(\d)+$/);

      if (match === null) {
        return;
      }
      const [, fromStr, toStr] = match;

      acc.push({
        from: parseInt(fromStr),
        to: parseInt(toStr),
        emoteId: emoteId,
      });
    });

    return acc;
  }, [])
    // Sort emotes in ascending order of their appearance. So, this would be way
    // easier to replace some content in the original message.
    // Example:
    // [0, 2], [5, 8], [9, 13]
    // [5, 6], [10, 11], [12, 12]
    .sort((a, b) => a.from - b.from);
}

/**
 * Splits message into chunks with text and emote images.
 * @param message - original message.
 * @param emotes - information about emotes and their placements.
 */
function prepareMessage(message: string, emotes: Emote[]): MessageChunk | MessageChunk[] {
  if (emotes.length === 0) {
    return message;
  }

  return emotes.reduce<MessageChunk[]>((acc, emote, idx, arr) => {
    const { from, emoteId } = emote;

    // Message does not start with emote. We should copy everything between current emote
    // and previous one.
    if (from !== 0) {
      acc.push(idx === 0 ? message.slice(0, from) : message.slice(arr[idx - 1].to + 1, from));
    }

    acc.push({
      imgUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`,
    });

    return acc;
  }, []);
}

/**
 * Converts message received from Twitch IRC to local format.
 * @param message - message text.
 * @param tags - message tags.
 */
export function prepareTwitchMessage(message: string, tags: ChatUserstate): Message | null {
  // There is something wrong with types in tmi.js. badges can be null as well as emotes and
  // display name. We should not forget about it.
  const {
    badges,
    color,
    emotes,
    'display-name': displayName,
    'message-type': messageType,
    id = Math.random().toString(),
  } = tags;

  if (!displayName || (messageType && messageType !== 'chat')) {
    return null;
  }

  return {
    id,
    username: displayName,
    badges: badges || undefined,
    message: emotes ? prepareMessage(message, prepareEmotes(emotes)) : message,
    usernameColor: color,
  };
}

/**
 * Returns this list of badges images.
 * @param badges - badges map.
 */
export function prepareBadges(badges: Badges): string[] {
  return Object.entries(badges).reduce<string[]>((acc, [key, value = '']) => {
    const images = globalBadges[key]?.[value] || [];

    if (images.length > 0) {
      acc.push(images[images.length - 1]);
    }

    return acc;
  }, []);
}