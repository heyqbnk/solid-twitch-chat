import {
  type Component,
  createMemo,
  For,
  Show,
  onCleanup,
  onMount,
} from 'solid-js';

import styles from './Message.module.scss';
import { MessageChunk } from '../../types';

interface Props {
  badges?: string[];
  username: string;
  usernameColor?: string;
  message: MessageChunk | MessageChunk[];
  onUnmount: (el: HTMLDivElement) => void;
  onMount: (el: HTMLDivElement) => void;
}

const TWITCH_BRAND_COLOR = '#9147ff';

export const Message: Component<Props> = props => {
  const usernameColor = createMemo(() => props.usernameColor || TWITCH_BRAND_COLOR);
  const messageChunks = createMemo(() => {
    return Array.isArray(props.message) ? props.message : [props.message];
  });

  let rootDiv: HTMLDivElement | undefined;

  onMount(() => {
    if (rootDiv) {
      props.onMount(rootDiv);
    }

    onCleanup(() => {
      if (rootDiv) {
        props.onUnmount(rootDiv);
      }
    });
  });

  return (
    <div class={styles.root} ref={el => rootDiv = el}>
      <Show when={props.badges && props.badges.length > 0}>
        <div class={styles.badges}>
          <For each={props.badges || []}>
            {badge => <img class={styles.badge} src={badge} alt={'badge'}/>}
          </For>
        </div>
      </Show>
      <span class={styles.name} style={{ color: usernameColor() }}>{props.username}</span>
      <span class={styles.message}>
        <For each={messageChunks()}>
          {part => {
            return typeof part === 'string'
              ? <span>{part}</span>
              : <img class={styles.emote} src={part.imgUrl} alt={'emote'}/>;
          }}
        </For>
      </span>
    </div>
  );
};