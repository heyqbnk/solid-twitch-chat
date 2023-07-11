import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
} from 'solid-js';
import { Client, Options as TmiOptions } from 'tmi.js';
import cn from 'classnames';

import type { Message as TwitchMessage } from '../../types';
import { Message } from '../Message';
import { prepareBadges, prepareTwitchMessage } from './utils';

import styles from './Widget.module.scss';

export interface WidgetProps {
  class?: string;
  clientSettings: TmiOptions;
}

/**
 * Represents a wrapper containing all chat messages.
 */
export const Widget: Component<WidgetProps> = props => {
  // Root div containing all messages.
  const [rootDiv, setRootDiv] = createSignal<HTMLDivElement | null>(null);

  // Messages received from tmi client.
  const [messages, setMessages] = createSignal<TwitchMessage[]>([]);

  // Effect which creates new client and removes previous one.
  createEffect<Client>(() => {
    const onError = (e: unknown) => {
      console.error('Error', e);
    };

    const client = new Client(props.clientSettings);

    // Connect client, assign new messages handler.
    client.connect().catch(onError);

    // When message was received, we should add it to our stored messages.
    client.on('message', (channel, tags, message, self) => {
      if (self) {
        return;
      }

      const preparedMessage = prepareTwitchMessage(message, tags);

      if (preparedMessage === null) {
        return;
      }

      setMessages(messages => [...messages, preparedMessage]);
    });

    // Drop this client on cleanup.
    onCleanup(() => {
      client.removeAllListeners().disconnect().catch(onError);
    });

    return client;
  });

  // Create Intersection observer, so we could know if some messages left the visible
  // area.
  const intersectionObserver = createMemo<IntersectionObserver>(() => {
    return new IntersectionObserver(entries => {
      // Detect which messages left visible area.
      const vanishedMessageIds = entries.reduce((acc, e) => {
        if (e.isIntersecting) {
          return acc;
        }

        const messageId = messageElements.get(e.target);

        if (messageId === undefined) {
          return acc;
        }

        return acc.add(messageId);
      }, new Set<string>());

      if (vanishedMessageIds.size === 0) {
        return;
      }

      // Leave only messages not included in array of vanished.
      setMessages(messages => messages.filter(m => !vanishedMessageIds.has(m.id)));
    }, { root: rootDiv() });
  });

  // Connections between message ids and their and the DOM elements.
  const messageElements = new Map<Element, string>();

  // Starts observing message.
  const observeMessage = createMemo(() => {
    const observer = intersectionObserver();

    return (id: string, el: HTMLDivElement) => {
      messageElements.set(el, id);
      observer.observe(el);
    };
  });

  return (
    <div class={cn(styles.root, props.class)} ref={setRootDiv}>
      <div class={styles.inner}>
        <For each={messages()}>
          {message => {
            const { badges = {}, id } = message;
            const formattedBadges = prepareBadges(badges);

            return (
              <Message
                {...message}
                badges={formattedBadges}
                onMount={el => observeMessage()(id, el)}
                onUnmount={el => intersectionObserver().unobserve(el)}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
};
