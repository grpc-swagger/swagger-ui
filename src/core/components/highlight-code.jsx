import React, {Component} from "react"
import PropTypes from "prop-types"
import saveAs from "js-file-download"
import {JsonEditor as Editor} from "jsoneditor-react"
import "jsoneditor-react/es/editor.min.css"
import ace from "brace"
import "brace/mode/json"
import "brace/theme/github"

export default class HighlightCode extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
    downloadable: PropTypes.bool,
    fileName: PropTypes.string
  }

  componentDidMount() {
    if (this.el.jsonEditor !== undefined) {
      this.el.jsonEditor.aceEditor.setOptions({maxLines: 100})
    }
  }

  componentDidUpdate() {
    let {value} = this.props
    if (!value.startsWith("<")) {
      let valueObj = JSON.parse(value)
      this.el.jsonEditor.set(valueObj)
    }
  }

  initializeComponent = (c) => {
    this.el = c
  }

  downloadText = () => {
    saveAs(this.props.value, this.props.fileName || "response.txt")
  }

  preventYScrollingBeyondElement = (e) => {
    const target = e.target

    var deltaY = e.nativeEvent.deltaY
    var contentHeight = target.scrollHeight
    var visibleHeight = target.offsetHeight
    var scrollTop = target.scrollTop

    const scrollOffset = visibleHeight + scrollTop

    const isElementScrollable = contentHeight > visibleHeight
    const isScrollingPastTop = scrollTop === 0 && deltaY < 0
    const isScrollingPastBottom = scrollOffset >= contentHeight && deltaY > 0

    if (isElementScrollable && (isScrollingPastTop || isScrollingPastBottom)) {
      e.preventDefault()
    }
  }

  render() {
    let {value, className, downloadable} = this.props
    className = className || ""
    let codeComponent
    if (value.startsWith("<")) {
      codeComponent =
        <pre
          ref={this.initializeComponent}
          onWheel={this.preventYScrollingBeyondElement}
          className={className + " microlight"}>
          {value}
        </pre>
    } else {
      let valueObj = JSON.parse(value)
      codeComponent =
        <Editor
          ref={this.initializeComponent}
          value={valueObj}
          mode="code"
          ace={ace}
          theme="ace/theme/github"
          indentation={4}
        />
    }
    return (
      <div className="highlight-code">
        {!downloadable ? null :
          <div className="download-contents" onClick={this.downloadText}>
            Download
          </div>
        }
        {codeComponent}
      </div>
    )
  }
}
