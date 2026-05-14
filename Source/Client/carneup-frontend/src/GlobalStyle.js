import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Brand colors */
    --brand:       #610005;
    --brand-dark:  #1a0002;
    --brand-light: #ffdad6;
    --brand-hover: #7f1d1d;

    /* Neutrals */
    --bg:          #f1f0ef;
    --surface:     #ffffff;
    --border:      #e7e5e4;
    --muted:       #a8a29e;
    --text:        #1c1917;
    --text-sub:    #78716c;

    /* Semantic */
    --success: #15803d;
    --warning: #b45309;
    --danger:  #ba1a1a;
    --info:    #1d4ed8;

    /* Sidebar */
    --sidebar-bg:      #18181b;
    --sidebar-hover:   rgba(255,255,255,0.07);
    --sidebar-active:  rgba(97,0,5,0.85);
    --sidebar-text:    rgba(255,255,255,0.65);
    --sidebar-text-hi: #ffffff;

    /* Spacing */
    --radius-sm: 6px;
    --radius:    10px;
    --radius-lg: 16px;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--bg);
    font-family: 'Work Sans', sans-serif;
    color: var(--text);
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Epilogue', sans-serif;
    font-weight: 900;
  }

  button { font-family: inherit; }

  input, select, textarea {
    font-family: 'Work Sans', sans-serif;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-block;
    line-height: 1;
    font-size: 24px;
    user-select: none;
  }

  *::-webkit-scrollbar { width: 4px; height: 4px; }
  *::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }

  @media print {
    .no-print { display: none !important; }
    body { background: white; }
  }
`
