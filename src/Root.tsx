import { Component } from 'solid-js';
import { Widget, WidgetProps } from './components/Widget';

import styles from './Root.module.scss';

type Props = WidgetProps;

/**
 * Application root component.
 */
export const Root: Component<Props> = props => {
  return <Widget class={styles.root} clientSettings={props.clientSettings}/>;
};