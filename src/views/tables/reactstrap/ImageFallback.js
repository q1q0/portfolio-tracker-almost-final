import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ImageFallback extends Component {
  constructor(props) {
    super(props);

    this.state = {
      src: props.src,
      errored: false,
    };
  }

  onError = () => {
    if (!this.state.errored) {
      this.setState({
        src: 'https://i.ibb.co/vk3bgz1/notoken.png',
        errored: true,
      });
    }
  }

  render() {
    const { src } = this.state;
    const {
      src: _1,
      fallbackSrc: _2,
      ...props
    } = this.props;

    return (
      <img
        src={src}
        onError={this.onError}
        {...props}
      />
    );
  }
}

Image.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
};

export default ImageFallback