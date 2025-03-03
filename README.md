# Swiper JS with React Sandbox

A basic implementation of Swiper JS with React for testing and development purposes.

## Setup

This project uses:
- React 18.2.0
- Swiper 11.2.4
- Webpack for bundling

To install the dependencies, run:

```bash
# Using yarn
yarn install

# Or using npm
npm install
```

## Usage

1. Start the development server:
```bash
# Using yarn
yarn start

# Or using npm
npm start
```

2. Open your browser at http://localhost:3000 to view the Swiper implementation.

3. Modify the code in the `src` directory to experiment with different Swiper features.

## Project Structure

```
swiper-fos/
├── src/
│   ├── components/
│   │   └── SwiperDemo.js   # Swiper React component
│   ├── App.js              # Main React App
│   ├── index.js            # Entry point
│   ├── index.html          # HTML template
│   └── styles.css          # Styles
├── webpack.config.js       # Webpack configuration
└── package.json            # Dependencies and scripts
```

## Features Implemented

The basic implementation includes:

- Responsive slider with 5 slides
- Navigation arrows
- Pagination bullets
- Auto-play functionality
- Responsive breakpoints for different screen sizes

## Customization

You can customize the Swiper instance by modifying the props in the `SwiperDemo.js` component. Here are some of the available options:

- Change the modules by modifying the `modules` array
- Adjust the speed with the `speed` prop
- Modify autoplay settings in the `autoplay` object
- Add more features like keyboard control, mousewheel control, etc.

For more information, refer to the [Swiper React Documentation](https://swiperjs.com/react). 