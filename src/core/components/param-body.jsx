import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { fromJS } from "immutable"
import { getSampleSchema } from "core/utils"
import {JsonEditor as Editor} from "jsoneditor-react"
import "jsoneditor-react/es/editor.min.css"
import ace from "brace"
import "brace/mode/json"
import "brace/theme/github"

const NOOP = Function.prototype

export default class ParamBody extends PureComponent {

  static propTypes = {
    param: PropTypes.object,
    onChange: PropTypes.func,
    onChangeConsumes: PropTypes.func,
    consumes: PropTypes.object,
    consumesValue: PropTypes.string,
    fn: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    isExecute: PropTypes.bool,
    specSelectors: PropTypes.object.isRequired,
    pathMethod: PropTypes.array.isRequired
  };

  static defaultProp = {
    consumes: fromJS(["application/json"]),
    param: fromJS({}),
    onChange: NOOP,
    onChangeConsumes: NOOP,
  };

  constructor(props, context) {
    super(props, context)

    this.state = {
      isEditBox: false,
      value: ""
    }

  }

  componentDidMount() {
    this.updateValues.call(this, this.props)
  }

  componentDidUpdate() {
    if (this.editor != null) {
      this.editor.jsonEditor.aceEditor.setOptions({maxLines: 100})
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateValues.call(this, nextProps)

  }

  updateValues = (props) => {
    let { param, isExecute } = props
    let paramValue = param.get("value")

    if ( paramValue !== undefined ) {
      let val = !paramValue ? "{}" : paramValue
      this.onChange(val, {isEditBox: isExecute})
    } else {
      this.onChange(this.sample(), {isEditBox: isExecute})
    }
  }

  sample = () => {
    let { param, fn:{inferSchema} } = this.props
    let schema = inferSchema(param.toJS())

    return getSampleSchema(schema, false, {
      includeWriteOnly: true
    })
  }

  onChange = (value, { isEditBox}) => {
    this.setState({value, isEditBox})
    this._onChange(value)
  }

  _onChange = (val) => { (this.props.onChange || NOOP)(val) }


  initializeEditor = (c) => {
    this.editor = c
  }

  handleOnChange = e => {
    const inputValue = JSON.stringify(e)
    this.onChange(inputValue, {isXml: false, isEditBox: true})
  }

  toggleIsEditBox = () => {
    this.setState( state => ({isEditBox: !state.isEditBox}))
  }

  render() {
    let {
      onChangeConsumes,
      param,
      isExecute,
      specSelectors,
      pathMethod,

      getComponent,
    } = this.props

    const Button = getComponent("Button")
    const HighlightCode = getComponent("highlightCode")
    const ContentType = getComponent("contentType")
    // for domains where specSelectors not passed
    let consumesValue = specSelectors.contentTypeValues(pathMethod).get("requestContentType")
    let consumes = this.props.consumes && this.props.consumes.size ? this.props.consumes : ParamBody.defaultProp.consumes

    let { value, isEditBox } = this.state
    let valueObj
    if (typeof value == "string" && value !== "") {
      try {
        valueObj = JSON.parse(value)
      } catch (e) {
        //
      }
    }

    return (
      <div className="body-param" data-param-name={param.get("name")} data-param-in={param.get("in")}>
        {
          isEditBox && isExecute
            ?
            <Editor
              mode="code"
              ace={ace}
              theme="ace/theme/github"
              indentation={4}
              value={valueObj}
              onChange={this.handleOnChange}
              ref={this.initializeEditor}
            />
            : (value && <HighlightCode className="body-param__example"
                               value={ value }/>)
        }
        <div className="body-param-options">
          {
            !isExecute ? null
                       : <div className="body-param-edit">
                        <Button className={isEditBox ? "btn cancel body-param__example-edit" : "btn edit body-param__example-edit"}
                                 onClick={this.toggleIsEditBox}>{ isEditBox ? "Cancel" : "Edit"}
                         </Button>
                         </div>
          }
          <label htmlFor="">
            <span>Parameter content type</span>
            <ContentType value={ consumesValue } contentTypes={ consumes } onChange={onChangeConsumes} className="body-param-content-type" />
          </label>
        </div>

      </div>
    )

  }
}
