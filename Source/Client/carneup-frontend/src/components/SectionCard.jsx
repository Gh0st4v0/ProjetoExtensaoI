import styled from 'styled-components'

const Card = styled.section`
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid #f3f4f6;
  color: #111827;
`

const CardTitle = styled.h3`
  font-family: 'Epilogue', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #1f2937;
  margin: 0 0 8px;
`

const CardCaption = styled.p`
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
`

export const SectionCard = ({ title, caption, children }) => {
  return (
    <Card>
      {title && <CardTitle>{title}</CardTitle>}
      {caption && <CardCaption>{caption}</CardCaption>}
      {children}
    </Card>
  )
}
