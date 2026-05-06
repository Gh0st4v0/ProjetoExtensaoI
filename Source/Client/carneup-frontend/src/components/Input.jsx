import styled, { css } from 'styled-components';

const lightStyles = css`
  background: #ffffff;
  border: 1px solid #e7e5e4;
  color: #1a1c1c;
  &::placeholder { color: #a8a29e; }
`;

const darkStyles = css`
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #ffffff;
  &::placeholder { color: rgba(255,255,255,0.6); }
`;

const StyledInput = styled.input`
  width: 100%;
  max-width: 100%;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  display: block;
  transition: border 0.18s, box-shadow 0.18s;
  ${(p) => (p.$variant === 'dark' ? darkStyles : lightStyles)}

  &:focus {
    box-shadow: 0 6px 18px rgba(97,0,5,0.06);
    border-color: #610005;
  }
`;

export const Input = ({ variant = 'light', ...props }) => {
  return <StyledInput $variant={variant} {...props} />;
};