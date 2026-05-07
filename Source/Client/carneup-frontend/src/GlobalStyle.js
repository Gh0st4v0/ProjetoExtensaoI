import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #eeeeee;
    font-family: 'Work Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-block;
    line-height: 1;
    font-size: 24px;
  }

  /* Hide scrollbars globally (Chrome, Edge, Safari, Firefox, IE) */
  *::-webkit-scrollbar {
    display: none;
  }
  html, body {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
`
