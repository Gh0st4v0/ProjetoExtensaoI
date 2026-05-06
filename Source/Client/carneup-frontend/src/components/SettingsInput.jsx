import styled from 'styled-components'

export const SettingsInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #d1d5db;
  color: #111827;
  font-size: 15px;
  padding: 14px 0 10px;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Work Sans', sans-serif;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #b91c1c;
  }
`
