/**
 * This component is based on the `<Prompt>` component in react-router v4:
 * https://github.com/ReactTraining/react-router/blob/bb969201817b4ce1667d3933a69497777e1cad15/packages/react-router/modules/Prompt.js
 */

/*
MIT License

Copyright (c) 2016-present React Training

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as React from 'react'
import { Navigation } from 'junctions'
import { NaviContext } from './NaviContext'


export interface PromptProps {
  when?: boolean,
  message: string | (() => string)
}


export function Prompt(props: PromptProps) {
  return (
    <NaviContext.Consumer>
      {context => <InnerPrompt context={context} {...props} />}
    </NaviContext.Consumer>
  )
}


/**
 * The public API for prompting the user before navigating away
 * from a screen with a component.
 */
class InnerPrompt extends React.Component<PromptProps & { context: NaviContext }> {
  navigation: Navigation;
  unblock?: () => void;

  static defaultProps = {
    when: true,
  }

  enable(message) {
    if (this.unblock) {
      this.unblock()
    }

    this.unblock = this.props.context.history.block(message)
  }

  disable() {
    if (this.unblock) {
      this.unblock()
      delete this.unblock
    }
  }

  componentDidMount() {
    if (this.props.when) {
      this.enable(this.props.message)
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.when) {
      if (!this.props.when || this.props.message !== nextProps.message) {
        this.enable(nextProps.message)
      }
    } else {
      this.disable()
    }
  }

  componentWillUnmount() {
    this.disable()
  }

  render() {
    return null
  }
}
