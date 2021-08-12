import React, { Component } from 'react';
import html2canvas from 'html2canvas';

export default class ScreenCapture extends Component {
  static defaultProps = {
    onStartCapture: () => null,
    onEndCapture: () => null,
    captureElementById: () => null,
  };

  state = {
    on: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    crossHairsTop: 0,
    crossHairsLeft: 0,
    isMouseDown: false,
    windowWidth: 0,
    windowHeight: 0,
    borderWidth: 0,
    cropPositionTop: 0,
    cropPositionLeft: 0,
    cropWidth: 0,
    cropHeight: 0,
    imageURL: '',
  };

  componentDidMount = () => {
    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleWindowResize);
  };

  handleWindowResize = () => {
    const windowWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    this.setState({
      windowWidth,
      windowHeight,
    });
  };

  handStartCapture = () => this.setState({ on: true });

  handleMouseMove = (e) => {
    const {
      isMouseDown,
      windowWidth,
      windowHeight,
      startX,
      startY,
      borderWidth,
    } = this.state;

    let cropPositionTop = startY;
    let cropPositionLeft = startX;
    const endX = e.clientX;
    const endY = e.clientY;
    const isStartTop = endY >= startY;
    const isStartBottom = endY <= startY;
    const isStartLeft = endX >= startX;
    const isStartRight = endX <= startX;
    const isStartTopLeft = isStartTop && isStartLeft;
    const isStartTopRight = isStartTop && isStartRight;
    const isStartBottomLeft = isStartBottom && isStartLeft;
    const isStartBottomRight = isStartBottom && isStartRight;
    let newBorderWidth = borderWidth;
    let cropWidth = 0;
    let cropHeight = 0;

    if (isMouseDown) {
      if (isStartTopLeft) {
        newBorderWidth = `${startY}px ${windowWidth - endX}px ${
          windowHeight - endY
        }px ${startX}px`;
        cropWidth = endX - startX;
        cropHeight = endY - startY;
      }

      if (isStartTopRight) {
        newBorderWidth = `${startY}px ${windowWidth - startX}px ${
          windowHeight - endY
        }px ${endX}px`;
        cropWidth = startX - endX;
        cropHeight = endY - startY;
        cropPositionLeft = endX;
      }

      if (isStartBottomLeft) {
        newBorderWidth = `${endY}px ${windowWidth - endX}px ${
          windowHeight - startY
        }px ${startX}px`;
        cropWidth = endX - startX;
        cropHeight = startY - endY;
        cropPositionTop = endY;
      }

      if (isStartBottomRight) {
        newBorderWidth = `${endY}px ${windowWidth - startX}px ${
          windowHeight - startY
        }px ${endX}px`;
        cropWidth = startX - endX;
        cropHeight = startY - endY;
        cropPositionLeft = endX;
        cropPositionTop = endY;
      }
    }

    this.setState({
      crossHairsTop: e.clientY,
      crossHairsLeft: e.clientX,
      borderWidth: newBorderWidth,
      cropWidth,
      cropHeight,
      cropPositionTop: cropPositionTop,
      cropPositionLeft: cropPositionLeft,
    });
  };

  handleMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;

    this.setState((prevState) => ({
      startX,
      startY,
      cropPositionTop: startY,
      cropPositionLeft: startX,
      isMouseDown: true,
      borderWidth: `${prevState.windowWidth}px ${prevState.windowHeight}px`,
    }));
  };

  handleMouseUp = (e) => {
    this.handleClickTakeScreenShot();
    this.setState({
      on: false,
      isMouseDown: false,
      borderWidth: 0,
    });
  };

  handleClickTakeScreenShot = () => {
    const {
      cropPositionTop,
      cropPositionLeft,
      cropWidth,
      cropHeight,
    } = this.state;
    const body = document.querySelector('body');

    // To exclude crosshair and backdrop from image
    document.getElementById('crosshairs').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    html2canvas(body).then((canvas) => {
      let croppedCanvas = document.createElement('canvas');
      let croppedCanvasContext = croppedCanvas.getContext('2d');

      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      // TODO: Make this image extend to TOP and LEFT also
      croppedCanvasContext.drawImage(
        canvas,
        cropPositionLeft,
        cropPositionTop,
        cropWidth + 30,
        cropHeight + 30,
        0,
        0,
        cropWidth,
        cropHeight
      );

      this.props.onEndCapture(croppedCanvas.toDataURL());
    });
  };

  renderChild = () => {
    const { children } = this.props;

    const props = {
      onStartCapture: this.handStartCapture,
      captureElementById: this.captureElementById,
    };

    if (typeof children === 'function') return children(props);
    return children;
  };

  captureElementById = () => {
    html2canvas(document.getElementById('capture')).then((canvas) => {
      this.props.onEndCapture(canvas.toDataURL());
    });
  };

  render() {
    const {
      on,
      crossHairsTop,
      crossHairsLeft,
      borderWidth,
      isMouseDown,
    } = this.state;

    if (!on) return this.renderChild();

    return (
      <div
        onMouseMove={this.handleMouseMove}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        {this.renderChild()}
        <div
          id="overlay"
          className={`overlay ${isMouseDown && 'highlighting'}`}
          style={{ borderWidth }}
        />
        <div
          id="crosshairs"
          className="crosshairs"
          style={{ left: crossHairsLeft + 'px', top: crossHairsTop + 'px' }}
        />
      </div>
    );
  }
}
