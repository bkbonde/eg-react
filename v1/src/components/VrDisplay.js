import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import _ from 'lodash';
import BarChart from './BarChart';
import LinearDrawingModel from '../model/LinearDrawingModel';
import DisplayedRegionModel from '../model/DisplayedRegionModel';

const is3D = true;

class VrDisplay extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        data: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    draw(width, height) {
        const canvas = $('<canvas></canvas')[0];
        canvas.width = width;
        canvas.height = height;
        const barChartDraw = BarChart.prototype.draw.bind(this);
        barChartDraw(canvas);
        const context = canvas.getContext("2d");
        context.strokeStyle = 'black';
        context.strokeRect(0, 0, width, height);
        const url = canvas.toDataURL();
        return url;
    }

    render() {
        let image = null;
        
        if (!is3D) {
            const canvasWidth = window.innerWidth * 5;
            const canvasHeight = 30;
            const url = this.draw(canvasWidth, canvasHeight);
            image = <a-image
                    src={url}
                    width={canvasWidth / 128}
                    height={canvasHeight / 128}
                    position="0 0 -1"
                ></a-image>
        } else {
            const trackLength = 50;
            const data = this.props.data;
            const non0Data = data.filter(record => record.value !== 0);
            if (non0Data.length > 0) {
                const drawModel = new LinearDrawingModel(this.props.viewRegion, trackLength);
                const dataMax = _.maxBy(non0Data, record => record.value).value;
                console.log(dataMax);
                const elements = non0Data.map(record => {
                    const height = (record.value/dataMax * 0.5);
                    if (height < 0.01) {
                        return null;
                    }
    
                    const width = drawModel.basesToXWidth(record.end - record.start);
                    const depth = 0.05;
                    const x = drawModel.baseToX(record.start) - trackLength / 2;
                    const y = height / 2 + 1;
                    return <a-box
                        key={record.start}
                        position={`${x} ${y} -1`}
                        width={width}
                        height={height}
                        depth={depth}
                        color="blue"
                    ></a-box>
                })
                image = elements;
            }
        }

        return (
        <a-scene embedded style={{width: 100, height: 100}}>
            {image}
            <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
            <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
            <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
            <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
            <a-sky color="#ECECEC"></a-sky>
        </a-scene>
        );
    }
}

export default VrDisplay;
