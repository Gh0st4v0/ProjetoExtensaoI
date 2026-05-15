import styled from 'styled-components'

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Work Sans', sans-serif;
  background: linear-gradient(145deg, #0d0001 0%, #2c0004 55%, #610005 100%);
  position: relative;
  overflow: hidden;

  /* grid de pontos sutil */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  /* brilho difuso no canto superior */
  &::after {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(180,40,30,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
`

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
  overflow: hidden;
  position: relative;
  z-index: 1;
`

const CardHeader = styled.div`
  background: linear-gradient(135deg, #1a0002 0%, #610005 100%);
  padding: 32px 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;

  /* brilho interno */
  &::after {
    content: '';
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
`

const LogoCircle = styled.div`
  width: 68px;
  height: 68px;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  position: relative;
  z-index: 1;
`

const BrandName = styled.h1`
  font-family: 'Epilogue', sans-serif;
  font-weight: 900;
  font-size: 26px;
  color: #ffffff;
  letter-spacing: -0.03em;
  margin: 0;
  position: relative;
  z-index: 1;
`

const Tagline = styled.p`
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  margin: 0;
  font-weight: 600;
  position: relative;
  z-index: 1;
`

const FormArea = styled.div`
  padding: 32px;
`

const Footer = styled.footer`
  margin-top: 20px;
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  position: relative;
  z-index: 1;
  letter-spacing: 0.04em;
`

export const AuthShell = ({ children }) => {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <LogoCircle>🥩</LogoCircle>
          <BrandName>CarneUp</BrandName>
          <Tagline>Gestão de Açougue</Tagline>
        </CardHeader>
        <FormArea>
          {children}
        </FormArea>
      </Card>
      <Footer>CarneUp System v1.0 &copy; 2026</Footer>
    </Wrapper>
  )
}
