import { FC, useRef, useState } from 'react'
import { Button, ButtonGroup, Card } from 'react-bootstrap'
import ReactPlayer from 'react-player'
import styled from 'styled-components'
import { BooleanParam, useQueryParam } from 'use-query-params'
import { CaptionProps, SegmentProps } from './types'

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: calc(900% / 16);
  overflow: hidden;
  background: var(--oc-gray-8);
`
const CaptionWrapper = styled.div`
  z-index: 1000;
  position: absolute;
  right: 1rem;
  bottom: 10%;
  left: 1rem;
  color: var(--oc-gray-0);
  text-align: center;
  font-size: 1.5rem;
`
const CaptionOverlay = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(52, 58, 64, 0.6);
`

const MainPlayer: FC<{
  url: string
  segments?: SegmentProps[]
  captions?: CaptionProps[]
}> = ({ url, segments, captions }) => {
  const [isDebugMode] = useQueryParam('debug', BooleanParam)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentClipIndex, setCurrentClipIndex] = useState(-1)
  const playerRef = useRef<ReactPlayer | null>(null)

  return (
    <>
      <VideoWrapper>
        <ReactPlayer
          ref={playerRef}
          url={url}
          controls={true}
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          progressInterval={100}
          playing={playing}
          onReady={() => {
            if (!segments) {
              return
            }
            setCurrentClipIndex(0)
            playerRef.current?.seekTo(segments[0].start)
            setPlaying(true)
          }}
          onPlay = { () => {
            playerRef.current?.getInternalPlayer().unloadModule("captions")
            playerRef.current?.getInternalPlayer().unloadModule("cc")
            }
          }
          onDuration={duration => {
            setDuration(duration)
          }}
          onProgress={({ playedSeconds }) => {
            setCurrentTime(playedSeconds)
            if (!segments || currentClipIndex === -1) {
              return
            }
            if (playedSeconds > segments[currentClipIndex].end) {
              if (currentClipIndex === segments.length - 1) {
                console.log('qq')
                setPlaying(false)
                return
              }
              setCurrentClipIndex(currentClipIndex + 1)
              if (playedSeconds < segments[currentClipIndex + 1].start) {
                playerRef.current?.seekTo(segments[currentClipIndex + 1].start)
              }
            }
          }}
        />

        <CaptionWrapper>
          {captions
            ?.filter(caption => caption.start < currentTime && caption.end > currentTime && caption.text)
            .map((caption, index) => (
              <div key={index}>
                <CaptionOverlay>{caption.text}</CaptionOverlay>
              </div>
            ))}
        </CaptionWrapper>
      </VideoWrapper>

      {(process.env.NODE_ENV === 'development' || isDebugMode) && (
        <div className="mt-5">
          <Card>
            <Card.Body>
              <Card.Title>Debug</Card.Title>
              <ButtonGroup aria-label="Basic example">
                <Button onClick={() => playerRef.current?.seekTo(Math.max(0, currentTime - 1))}>
                  <i className="fas fa-backward" />
                </Button>
                <Button onClick={() => setPlaying(!playing)}>
                  {playing ? <i className="fas fa-pause" /> : <i className="fas fa-play" />}
                </Button>
                <Button onClick={() => playerRef.current?.seekTo(Math.min(duration, currentTime + 1))}>
                  <i className="fas fa-forward" />
                </Button>
              </ButtonGroup>
              <div className="fs-2">{currentTime.toFixed(2)}s</div>
              <Card.Title>Segments</Card.Title>
              {segments?.map((segment, index) => (
                <div key={index}>
                  <span
                    className="text-primary cursor-pointer"
                    onClick={() => playerRef.current?.seekTo(segment.start)}
                  >
                    {segment.start.toFixed(2)}
                  </span>
                  <span> ~ </span>
                  <span className="text-primary cursor-pointer" onClick={() => playerRef.current?.seekTo(segment.end)}>
                    {segment.end.toFixed(2)}
                  </span>
                </div>
              ))}
              <Card.Title>Captions</Card.Title>
              <Card.Text>
                {captions?.map((caption, index) => (
                  <div key={index}>
                    <span
                      className="text-primary cursor-pointer"
                      onClick={() => playerRef.current?.seekTo(caption.start)}
                    >
                      {caption.start.toFixed(2)}
                    </span>
                    <span> ~ </span>
                    <span
                      className="text-primary cursor-pointer"
                      onClick={() => playerRef.current?.seekTo(caption.end)}
                    >
                      {caption.end.toFixed(2)}
                    </span>
                    <span className="d-inline-block ms-4">{caption.text}</span>
                  </div>
                ))}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  )
}

export default MainPlayer
