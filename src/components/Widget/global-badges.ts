import globalBadgesJson from './global-badges.json';

interface ReducedBadges {
  [name: string]: {
    [version: string]: string[];
  };
}

/**
 * Map, where key is a badge name, and value is an object, which contains information
 * about badge versions and their images.
 */
export const globalBadges = globalBadgesJson.globalBadges.reduce<ReducedBadges>((acc, badge) => {
  if (!(badge.id in acc)) {
    acc[badge.id] = { [badge.version]: badge.images };
  } else {
    acc[badge.id][badge.version] = badge.images;
  }
  return acc;
}, {});
