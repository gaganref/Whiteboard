import React, {Component} from "react";

import { Icon } from '@rsuite/icons';
import {IconButton, ButtonToolbar, InputNumber, InputGroup, RadioGroup, Radio} from 'rsuite';

import Draggable from 'react-draggable';

import { BsTextareaT } from "react-icons/bs";
import { BsSlashLg } from "react-icons/bs";

import { BiRectangle } from "react-icons/bi";
import { BiCircle } from "react-icons/bi";
import { BiPointer } from "react-icons/bi";

import './style.css';
import Whiteboard from "../whiteboard/Whiteboard";



const styles = {
    radioGroupLabel: {
        padding: '8px 2px 8px 10px',
        display: 'inline-block',
        verticalAlign: 'middle',
    }
};


class Container extends Component
{
    constructor(props){
        super(props);

        this.state = {
            color: "#000000",
            size: 5,
            drawType: "Mouse"
        }
    }

    changeColor(newColor){
        this.setState({
            color: newColor.target.value
        })
    }

    changeSize(newSize){
        this.setState({
            size: newSize
        })
    }

    changeDrawType(newDrawType){
        this.setState({
            drawType: newDrawType
        })
    }

    render (){
        return(
            <div className="container">
                <Draggable bounds="parent">
                    <div className="toolbox">
                        <RadioGroup name="radioList" inline appearance="picker" value={this.state.drawType} onChange={this.changeDrawType.bind(this)}>
                            <span style={styles.radioGroupLabel}>Draw Type: </span>
                            <Radio value="Mouse"><Icon as={BiPointer}/> Mouse</Radio>
                            <Radio value="Line"><Icon as={BsSlashLg}/> Line</Radio>
                            <Radio value="Circle"><Icon as={BiCircle}/> Circle</Radio>
                            <Radio value="Rectangle"><Icon as={BiRectangle}/> Rectangle</Radio>
                            <Radio value="Text"><Icon as={BsTextareaT}/> Text</Radio>
                        </RadioGroup>
                        <div>
                            <InputNumber prefix="Size" max={30} min={5} step={5} style={{width:130, float:"left", marginTop:20, marginRight:10}}
                                         value={this.state.size} onChange={this.changeSize.bind(this)}/>
                            <InputGroup style={{width: 120, float:"left", marginTop:20, marginRight:10}}>
                                <InputGroup.Addon>Color</InputGroup.Addon>
                                <input type="color" value={this.state.color} onChange={this.changeColor.bind(this)}/>
                            </InputGroup>
                        </div>
                    </div>
                </Draggable>
                <Whiteboard
                    color={this.state.color}
                    size={this.state.size}
                    drawType={this.state.drawType}
                ></Whiteboard>
            </div>
        )
    }
}

export default Container;
