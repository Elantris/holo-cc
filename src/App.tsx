import { FC, useEffect, useState } from 'react'
import { Card, Col, Container, Navbar, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import MainPlayer from './MainPlayer'
import { ClipProps } from './types'

const StyledContainer = styled(Container)`
  max-width: 100%;
`

const App: FC = () => {
  const [gistId] = useQueryParam('gistId', StringParam)

  const [clip, setClip] = useState<ClipProps | null>(null)

  useEffect(() => {
    setClip(null)

    if (!gistId) {
      return
    }

    fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        accept: 'application/vnd.github.v3+json',
      },
    })
      .then(async response => {
        const data = await response.json()
        const files: any = Object.values(data.files)
        setClip(JSON.parse(files[0].content))
      })
      .catch(console.error)
  }, [gistId])

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top">
        <StyledContainer className="px-4">
          <Navbar.Brand>Holo CC</Navbar.Brand>
        </StyledContainer>
      </Navbar>

      <div className="mt-5 pt-3 px-4">
        {clip && (
          <Row>
            <Col lg={8} className="mb-5">
              <MainPlayer url={clip.url} segments={clip.segments} captions={clip.captions} />
            </Col>
            <Col lg={4} className="mb-5">
              <Card>
                <Card.Body>
                  <Card.Title>Clip Information</Card.Title>
                  <Card.Text>
                    <div>
                      <span>Author: </span>
                      <span>{clip.author}</span>
                      {clip.authorLink && (
                        <a href={clip.authorLink} target="_blank" rel="noreferrer" className="ms-2">
                          {clip.authorLink}
                        </a>
                      )}
                    </div>
                    <div>
                      <span>Source: </span>
                      <span>
                        <a href={clip.url} target="_blank" rel="noreferrer">
                          {clip.url}
                        </a>
                      </span>
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  )
}

export default App
