export type ClipProps = {
  url: string
  title: string
  author: string
  authorLink?: string
  segments?: SegmentProps[]
  captions?: CaptionProps[]
}

export type SegmentProps = {
  start: number
  end: number
}

export type CaptionProps = {
  start: number
  end: number
  text?: string
  color?: string | number
}
