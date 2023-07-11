interface Badges {
  [badgeName: string]: string | undefined;
}

interface Emote {
  imgUrl: string;
}

/**
 * Part of the message. Could represent standard text or emote image.
 */
export type MessageChunk = string | Emote;

/**
 * Describes message sent from Twitch.
 */
export interface Message {
  id: string;
  badges?: Badges;
  username: string;
  usernameColor?: string;
  message: MessageChunk | MessageChunk[];
}